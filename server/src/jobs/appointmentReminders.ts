import cron from "node-cron";
import Appointment from "../models/Appointment";
import Settings from "../models/Settings";
import { sendAppointmentReminder, sendAppointmentFollowUp } from "../utils/email";
import { sendAppointmentReminderSMS } from "../utils/sms";
import logger from "../utils/logger";

/**
 * Send reminder emails for upcoming appointments based on configured reminder times
 * Runs daily at the configured time (default: 9:00 AM)
 */
export function startAppointmentReminderJob() {
  // Run every hour to check for reminders (will internally check settings for exact timing)
  cron.schedule("0 * * * *", async () => {
    logger.info("Running appointment reminder job...");

    try {
      // Get settings
      const settings = await Settings.findOne();

      if (!settings || !settings.reminderSettings?.enabled) {
        logger.info("Reminder system is disabled in settings");
        return;
      }

      const reminderTimes = settings.reminderSettings.reminderTimes.filter(rt => rt.enabled);

      if (reminderTimes.length === 0) {
        logger.info("No reminder times configured");
        return;
      }

      const now = new Date();
      let totalSuccess = 0;
      let totalFail = 0;

      // Process each reminder time window
      for (const reminderTime of reminderTimes) {
        const hoursBeforeAppointment = reminderTime.hoursBeforeAppointment;

        // Calculate the time window for this reminder
        const reminderStartTime = new Date(now);
        reminderStartTime.setHours(reminderStartTime.getHours() + hoursBeforeAppointment);
        reminderStartTime.setMinutes(0, 0, 0);

        const reminderEndTime = new Date(reminderStartTime);
        reminderEndTime.setHours(reminderEndTime.getHours() + 1);

        logger.info(`Checking for appointments ${hoursBeforeAppointment} hours from now...`);

        // Find appointments in this time window that haven't been reminded yet
        const upcomingAppointments = await Appointment.find({
          startTime: {
            $gte: reminderStartTime,
            $lt: reminderEndTime,
          },
          status: { $in: ["scheduled", "confirmed"] },
          reminderSent: false,
          isPrivate: false, // Don't send reminders for private appointments
        })
          .populate("customerId", "name email phone")
          .populate("assignedTo", "name email");

        logger.info(`Found ${upcomingAppointments.length} appointments to remind (${hoursBeforeAppointment}h window)`);

        // Send reminders
        for (const appointment of upcomingAppointments) {
          try {
            // Send email reminder if enabled
            if (settings.reminderSettings.reminderMethods.email) {
              await sendAppointmentReminder(appointment);
            }

            // Send SMS reminder if enabled
            if (settings.reminderSettings.reminderMethods.sms) {
              try {
                await sendAppointmentReminderSMS(appointment);
              } catch (smsError) {
                logger.error(`SMS reminder failed for appointment ${appointment._id}:`, smsError);
                // Continue even if SMS fails
              }
            }

            // Mark as reminder sent
            appointment.reminderSent = true;
            appointment.reminderSentAt = new Date();
            await appointment.save();

            totalSuccess++;
            logger.info(`Sent ${hoursBeforeAppointment}h reminder for appointment ${appointment._id}`);
          } catch (error) {
            totalFail++;
            logger.error(`Failed to send reminder for appointment ${appointment._id}:`, error);
          }
        }
      }

      if (totalSuccess > 0 || totalFail > 0) {
        logger.info(
          `Appointment reminder job complete: ${totalSuccess} sent, ${totalFail} failed`
        );
      }
    } catch (error) {
      logger.error("Error in appointment reminder job:", error);
    }
  });

  logger.info("Appointment reminder job scheduled (runs hourly)");
}

/**
 * Send follow-up reminders for completed appointments
 * Runs daily to check for completed appointments that need follow-up
 */
export function startFollowUpReminderJob() {
  // Run daily at 10:00 AM
  cron.schedule("0 10 * * *", async () => {
    logger.info("Running follow-up reminder job...");

    try {
      // Get settings
      const settings = await Settings.findOne();

      if (!settings || !settings.reminderSettings?.followUpReminders?.enabled) {
        logger.info("Follow-up reminders are disabled in settings");
        return;
      }

      const daysAfterCompletion = settings.reminderSettings.followUpReminders.daysAfterCompletion;
      const now = new Date();

      // Calculate the target completion date
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - daysAfterCompletion);
      targetDate.setHours(0, 0, 0, 0);

      const targetDateEnd = new Date(targetDate);
      targetDateEnd.setHours(23, 59, 59, 999);

      // Find completed appointments from the target date that haven't received follow-up
      const completedAppointments = await Appointment.find({
        status: "completed",
        actualCompletionDate: {
          $gte: targetDate,
          $lte: targetDateEnd,
        },
        followUpSent: { $ne: true },
        isPrivate: false,
      })
        .populate("customerId", "name email")
        .populate("assignedTo", "name");

      logger.info(`Found ${completedAppointments.length} appointments for follow-up`);

      let successCount = 0;
      let failCount = 0;

      for (const appointment of completedAppointments) {
        try {
          await sendAppointmentFollowUp(appointment);

          // Mark follow-up as sent
          (appointment as any).followUpSent = true;
          (appointment as any).followUpSentAt = new Date();
          await appointment.save();

          successCount++;
          logger.info(`Sent follow-up for appointment ${appointment._id}`);
        } catch (error) {
          failCount++;
          logger.error(`Failed to send follow-up for appointment ${appointment._id}:`, error);
        }
      }

      logger.info(
        `Follow-up reminder job complete: ${successCount} sent, ${failCount} failed`
      );
    } catch (error) {
      logger.error("Error in follow-up reminder job:", error);
    }
  });

  logger.info("Follow-up reminder job scheduled (runs daily at 10:00 AM)");
}

/**
 * Send immediate reminder for a specific appointment (for testing or manual trigger)
 */
export async function sendImmediateReminder(appointmentId: string) {
  try {
    const appointment = await Appointment.findById(appointmentId)
      .populate("customerId", "name email")
      .populate("assignedTo", "name email");

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (appointment.isPrivate) {
      throw new Error("Cannot send reminder for private appointment");
    }

    await sendAppointmentReminder(appointment);

    appointment.reminderSent = true;
    appointment.reminderSentAt = new Date();
    await appointment.save();

    return { success: true, message: "Reminder sent successfully" };
  } catch (error: any) {
    logger.error("Failed to send immediate reminder:", error);
    throw new Error(error.message || "Failed to send reminder");
  }
}
