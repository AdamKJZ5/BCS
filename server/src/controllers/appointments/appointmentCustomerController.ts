/**
 * Appointment Customer Controller
 * Handles customer-facing appointment operations
 */

import { Request, Response, NextFunction } from "express";
import Appointment from "../../models/Appointment";
import User from "../../models/User";
import { AppError } from "../../utils/AppError";
import { sendAppointmentConfirmation } from "../../utils/email";
import { notifyAllAdmins } from "../../utils/createNotification";
import logger from "../../utils/logger";
import { autoAssignEmployee } from "./appointmentUtils";

/**
 * Create appointment (customer)
 */
export const createAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const {
      startTime,
      duration,
      appointmentType,
      description,
      vehicleInfo,
      leadId,
    } = req.body;

    if (!startTime || !duration || !appointmentType) {
      throw new AppError("Missing required fields", 400);
    }

    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60000);

    // Check for conflicts
    const conflicts = await Appointment.find({
      startTime: { $lt: end },
      endTime: { $gt: start },
      status: { $in: ["scheduled", "confirmed", "in_progress"] },
    });

    if (conflicts.length > 0) {
      throw new AppError("Time slot no longer available", 409);
    }

    // Auto-assign to admin with fewest appointments
    const assignedToId = await autoAssignEmployee();

    // Generate title
    const user = await User.findById(userId);
    const title = `${appointmentType.replace("_", " ")} - ${user?.name || "Customer"}`;

    const appointmentData: any = {
      customerId: userId,
      leadId,
      appointmentType,
      title,
      description,
      startTime: start,
      endTime: end,
      duration,
      vehicleInfo,
      createdBy: userId,
      isPrivate: false,
      visibleToCustomer: true,
    };

    if (assignedToId) {
      appointmentData.assignedTo = assignedToId;
    }

    const appointment = await Appointment.create(appointmentData);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customerId", "name email phone")
      .populate("assignedTo", "name email");

    // Send confirmation email
    if (populatedAppointment) {
      try {
        await sendAppointmentConfirmation(populatedAppointment);
        populatedAppointment.confirmationSent = true;
        await populatedAppointment.save();
      } catch (emailError) {
        logger.error("Failed to send confirmation email:", emailError);
      }

      // Notify admins of new appointment
      try {
        const formattedDate = new Date(populatedAppointment.startTime).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
        const customerName = (populatedAppointment.customerId as any).name || "A customer";
        await notifyAllAdmins({
          type: "appointment",
          title: "New Appointment Scheduled",
          message: `${customerName} scheduled a ${appointmentType.replace("_", " ")} appointment for ${formattedDate}`,
          relatedAppointment: populatedAppointment._id,
          actionUrl: "/admin/calendar",
        });
      } catch (notifError) {
        logger.error("Failed to send notification:", notifError);
      }
    }

    res.status(201).json({
      success: true,
      message: "Appointment created successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my appointments (customer)
 */
export const getMyAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    const appointments = await Appointment.find({
      customerId: userId,
      visibleToCustomer: true,
    })
      .populate("assignedTo", "name email phone")
      .populate("leadId", "damageDescription vehicleInfo")
      .sort({ startTime: 1 });

    res.json({
      success: true,
      appointments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment (customer can only cancel)
 */
export const updateAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { status, cancellationReason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Verify ownership
    if (appointment.customerId.toString() !== userId) {
      throw new AppError("Not authorized", 403);
    }

    // Customer can only cancel
    if (status && status !== "cancelled") {
      throw new AppError("Customers can only cancel appointments", 403);
    }

    // Check if within cancellation window (24 hours)
    const hoursDiff = (appointment.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      throw new AppError("Cannot cancel within 24 hours of appointment", 400);
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason || "Cancelled by customer";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel appointment (customer)
 */
export const cancelAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const { reason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Verify ownership
    if (appointment.customerId.toString() !== userId) {
      throw new AppError("Not authorized", 403);
    }

    // Check if already cancelled or completed
    if (["cancelled", "completed", "no_show"].includes(appointment.status)) {
      throw new AppError("Cannot cancel this appointment", 400);
    }

    // Check if within cancellation window (24 hours)
    const hoursDiff = (appointment.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      throw new AppError("Cannot cancel within 24 hours of appointment", 400);
    }

    appointment.status = "cancelled";
    appointment.cancellationReason = reason || "Cancelled by customer";
    await appointment.save();

    res.json({
      success: true,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};
