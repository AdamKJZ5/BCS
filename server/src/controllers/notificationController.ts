import { Request, Response, NextFunction } from "express";
import Notification from "../models/Notification";
import { AppError } from "../utils/AppError";

/**
 * Get user's notifications
 */
export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const query: any = { userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip))
      .populate("relatedAppointment", "appointmentType startTime")
      .populate("relatedInvoice", "invoiceNumber total")
      .populate("relatedLead", "name email");

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    const count = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const notification = await Notification.findOne({ _id: id, userId });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    res.json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { id } = req.params;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 */
export const deleteAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    const result = await Notification.deleteMany({ userId, read: true });

    res.json({
      success: true,
      message: `Deleted ${result.deletedCount} read notifications`,
    });
  } catch (error) {
    next(error);
  }
};
