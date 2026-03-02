/**
 * Notification Service
 * Business logic layer for notification operations
 */

import { sendAppointmentConfirmation, sendAppointmentReminder, sendStatusUpdateEmail } from "../utils/email";
import { sendAppointmentStatusSMS } from "../utils/sms";
import { createNotification, notifyAllAdmins } from "../utils/createNotification";
import logger from "../utils/logger";

/**
 * Send appointment confirmation to customer
 */
export async function sendAppointmentConfirmationNotification(appointment: any): Promise<void> {
  try {
    // Send email
    await sendAppointmentConfirmation(appointment);

    // Mark as sent
    appointment.confirmationSent = true;
    await appointment.save();

    logger.info(`Sent confirmation for appointment ${appointment._id}`);
  } catch (error) {
    logger.error(`Failed to send appointment confirmation for ${appointment._id}:`, error);
    throw error;
  }
}

/**
 * Notify admins of new appointment
 */
export async function notifyAdminsOfNewAppointment(appointment: any): Promise<void> {
  try {
    const formattedDate = new Date(appointment.startTime).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

    const customerName = appointment.customerId?.name || "A customer";
    const appointmentType = appointment.appointmentType.replace(/_/g, " ");

    await notifyAllAdmins({
      type: "appointment",
      title: "New Appointment Scheduled",
      message: `${customerName} scheduled a ${appointmentType} appointment for ${formattedDate}`,
      relatedAppointment: appointment._id,
      actionUrl: "/admin/calendar",
    });

    logger.info(`Notified admins of new appointment ${appointment._id}`);
  } catch (error) {
    logger.error(`Failed to notify admins of appointment ${appointment._id}:`, error);
    // Don't throw - this is a non-critical notification
  }
}

/**
 * Send appointment status update notifications
 */
export async function sendAppointmentStatusUpdate(params: {
  appointment: any;
  oldStatus: string;
  newStatus: string;
}): Promise<void> {
  const { appointment, oldStatus, newStatus } = params;

  try {
    // Send SMS if customer has phone number
    const customer = appointment.customerId;
    if (customer?.phone) {
      try {
        await sendAppointmentStatusSMS(appointment, newStatus);
        logger.info(`Sent SMS status update for appointment ${appointment._id}`);
      } catch (smsError) {
        logger.error(`Failed to send SMS for appointment ${appointment._id}:`, smsError);
      }
    }

    // Create in-app notification for customer
    if (customer?._id) {
      try {
        const statusMessages: Record<string, string> = {
          confirmed: "Your appointment has been confirmed!",
          in_progress: "Your vehicle service is now in progress.",
          completed: "Your service is complete! Your vehicle is ready.",
          cancelled: "Your appointment has been cancelled.",
        };

        await createNotification({
          userId: customer._id,
          type: "appointment",
          title: "Appointment Status Update",
          message: statusMessages[newStatus] || `Appointment status changed to ${newStatus}`,
          relatedAppointment: appointment._id,
          actionUrl: "/customer/dashboard",
        });

        logger.info(`Created in-app notification for appointment ${appointment._id}`);
      } catch (notifError) {
        logger.error(`Failed to create notification for appointment ${appointment._id}:`, notifError);
      }
    }
  } catch (error) {
    logger.error(`Failed to send status update for appointment ${appointment._id}:`, error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Send appointment reminders (for cron job)
 */
export async function sendAppointmentReminders(appointments: any[]): Promise<void> {
  logger.info(`Processing ${appointments.length} appointment reminders`);

  for (const appointment of appointments) {
    try {
      await sendAppointmentReminder(appointment);
      logger.info(`Sent reminder for appointment ${appointment._id}`);
    } catch (error) {
      logger.error(`Failed to send reminder for appointment ${appointment._id}:`, error);
    }
  }
}

/**
 * Send lead status update notification
 */
export async function sendLeadStatusUpdateNotification(params: {
  customerEmail: string;
  customerName: string;
  leadDetails: {
    serviceType: string;
    submittedDate: string;
    oldStatus: string;
    newStatus: string;
  };
}): Promise<void> {
  try {
    await sendStatusUpdateEmail(
      params.customerEmail,
      params.customerName,
      params.leadDetails
    );
    logger.info(`Sent lead status update email to ${params.customerEmail}`);
  } catch (error) {
    logger.error(`Failed to send lead status update to ${params.customerEmail}:`, error);
    // Don't throw - email is non-critical
  }
}
