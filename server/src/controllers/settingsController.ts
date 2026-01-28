import { Request, Response, NextFunction } from "express";
import Settings from "../models/Settings";
import { AppError } from "../utils/AppError";

/**
 * Get settings (creates default settings if none exist)
 */
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let settings = await Settings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        businessInfo: {
          name: "Bellevue Collision Services",
          phone: "(425) 373-0308",
          email: "info@bellevuecollisionservices.com",
          address: "13434 SE 27th Pl, Bellevue WA 98005",
        },
        hours: {
          weekday: "8:00 AM - 5:30 PM",
          saturday: "By Appointment Only",
          sunday: "Closed",
        },
        emailSettings: {
          notificationEmail: process.env.OWNER_EMAIL || "shop-owner@example.com",
          autoReplyEnabled: true,
        },
      });
    }

    res.status(200).json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update settings
 */
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { businessInfo, hours, emailSettings, appointmentSettings, reminderSettings } = req.body;

    let settings = await Settings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = await Settings.create({
        businessInfo,
        hours,
        emailSettings,
        appointmentSettings,
        reminderSettings,
      });
    } else {
      // Update existing settings
      if (businessInfo) {
        settings.businessInfo = { ...settings.businessInfo, ...businessInfo };
      }
      if (hours) {
        settings.hours = { ...settings.hours, ...hours };
      }
      if (emailSettings) {
        settings.emailSettings = { ...settings.emailSettings, ...emailSettings };
      }
      if (appointmentSettings) {
        settings.appointmentSettings = { ...settings.appointmentSettings, ...appointmentSettings };
      }
      if (reminderSettings) {
        settings.reminderSettings = { ...settings.reminderSettings, ...reminderSettings };
      }

      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Initialize default reminder settings if they don't exist
 */
export const initializeReminderSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let settings = await Settings.findOne();

    if (!settings) {
      throw new AppError("Settings not found. Please create settings first.", 404);
    }

    // Initialize reminder settings if not present
    if (!settings.reminderSettings || !settings.reminderSettings.reminderTimes || settings.reminderSettings.reminderTimes.length === 0) {
      settings.reminderSettings = {
        enabled: true,
        reminderTimes: [
          { enabled: true, hoursBeforeAppointment: 24, label: "24 hours before" },
          { enabled: false, hoursBeforeAppointment: 48, label: "48 hours before" },
          { enabled: false, hoursBeforeAppointment: 168, label: "1 week before" },
        ],
        followUpReminders: {
          enabled: false,
          daysAfterCompletion: 7,
        },
        reminderMethods: {
          email: true,
          sms: false,
        },
        jobScheduleTime: "09:00",
      };

      await settings.save();
    }

    res.status(200).json({
      success: true,
      message: "Reminder settings initialized",
      settings,
    });
  } catch (error) {
    next(error);
  }
};
