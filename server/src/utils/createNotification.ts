import Notification from "../models/Notification";
import { Types } from "mongoose";
import logger from "../utils/logger";

interface CreateNotificationParams {
  userId: Types.ObjectId | string;
  type: "appointment" | "invoice" | "payment" | "lead" | "review" | "system";
  title: string;
  message: string;
  relatedAppointment?: Types.ObjectId | string;
  relatedInvoice?: Types.ObjectId | string;
  relatedLead?: Types.ObjectId | string;
  relatedEntity?: Types.ObjectId | string; // For generic entities like reviews
  actionUrl?: string;
}

/**
 * Create a notification for a user
 */
export async function createNotification(params: CreateNotificationParams) {
  try {
    const notificationData: any = {
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
    };

    if (params.relatedAppointment) {
      notificationData.relatedAppointment = params.relatedAppointment;
    }
    if (params.relatedInvoice) {
      notificationData.relatedInvoice = params.relatedInvoice;
    }
    if (params.relatedLead) {
      notificationData.relatedLead = params.relatedLead;
    }
    if (params.relatedEntity) {
      notificationData.relatedEntity = params.relatedEntity;
    }
    if (params.actionUrl) {
      notificationData.actionUrl = params.actionUrl;
    }

    const notification = await Notification.create(notificationData);

    return notification;
  } catch (error) {
    logger.error("Failed to create notification:", error);
    // Don't throw - notifications shouldn't break the main flow
    return null;
  }
}

/**
 * Create notifications for all admin users
 */
export async function notifyAllAdmins(params: Omit<CreateNotificationParams, "userId">) {
  try {
    const User = require("../models/User").default;
    const admins = await User.find({ role: "admin" });

    const notifications = await Promise.all(
      admins.map((admin: any) =>
        createNotification({
          ...params,
          userId: admin._id,
        })
      )
    );

    return notifications.filter((n) => n !== null);
  } catch (error) {
    logger.error("Failed to notify admins:", error);
    return [];
  }
}
