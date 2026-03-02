/**
 * Appointment Export Controller
 * Handles exporting appointments to iCal format
 */

import { Request, Response, NextFunction } from "express";
import Appointment from "../../models/Appointment";
import { AppError } from "../../utils/AppError";
import { generateSingleAppointmentICalFile, generateICalFile } from "../../utils/icalGenerator";

/**
 * Export a single appointment as iCal (.ics) file
 * Accessible by customer (their appointment) or admin (any appointment)
 */
export const exportAppointmentICalendSingle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const appointment = await Appointment.findById(id)
      .populate("customerId", "name email")
      .populate("assignedTo", "name email");

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Authorization: customers can only export their own appointments
    if (userRole === "customer" && appointment.customerId._id.toString() !== userId) {
      throw new AppError("Not authorized to export this appointment", 403);
    }

    // Format appointment type for title
    const appointmentTypeLabel = appointment.appointmentType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const title = `${appointmentTypeLabel} - Bellevue Collision Services`;
    const description = appointment.description || `${appointmentTypeLabel} appointment at Bellevue Collision Services`;

    const customerName = (appointment.customerId as any).name || "Customer";
    const customerEmail = (appointment.customerId as any).email || "";

    const icalData = generateSingleAppointmentICalFile({
      id: appointment._id.toString(),
      title,
      description,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      location: "Bellevue Collision Services, 13434 SE 27th Pl, Bellevue WA 98005",
      attendeeEmail: customerEmail,
      attendeeName: customerName,
      organizerEmail: process.env.BUSINESS_EMAIL || "info@bellevuecollision.com",
      organizerName: "Bellevue Collision Services",
      status: appointment.status,
    });

    // Set headers for .ics file download
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="appointment-${appointment._id}.ics"`);

    res.send(icalData);
  } catch (error) {
    next(error);
  }
};

/**
 * Export customer's appointments as iCal (.ics) file for calendar subscription
 */
export const exportMyAppointmentsICal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new AppError("Not authenticated", 401);
    }

    // Get all non-cancelled appointments for this customer
    const appointments = await Appointment.find({
      customerId: userId,
      status: { $ne: "cancelled" },
    })
      .populate("customerId", "name email")
      .populate("assignedTo", "name email")
      .sort({ startTime: 1 });

    const icalAppointments = appointments.map((appointment) => {
      const appointmentTypeLabel = appointment.appointmentType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const title = `${appointmentTypeLabel} - Bellevue Collision Services`;
      const description = appointment.description || `${appointmentTypeLabel} appointment at Bellevue Collision Services`;

      const customerName = (appointment.customerId as any).name || "Customer";
      const customerEmail = (appointment.customerId as any).email || "";

      return {
        id: appointment._id.toString(),
        title,
        description,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        location: "Bellevue Collision Services, 13434 SE 27th Pl, Bellevue WA 98005",
        attendeeEmail: customerEmail,
        attendeeName: customerName,
        organizerEmail: process.env.BUSINESS_EMAIL || "info@bellevuecollision.com",
        organizerName: "Bellevue Collision Services",
        status: appointment.status,
      };
    });

    const icalData = generateICalFile(icalAppointments);

    // Set headers for .ics file download
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="bellevue-collision-appointments.ics"`);

    res.send(icalData);
  } catch (error) {
    next(error);
  }
};

/**
 * Export all appointments as iCal (.ics) file (admin only)
 */
export const exportAllAppointmentsICal = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, employeeId } = req.query;

    const query: any = {
      status: { $ne: "cancelled" },
    };

    // Filter by date range if provided
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate as string);
      }
    }

    // Filter by employee if provided
    if (employeeId && employeeId !== "all") {
      query.assignedTo = employeeId;
    }

    const appointments = await Appointment.find(query)
      .populate("customerId", "name email")
      .populate("assignedTo", "name email")
      .sort({ startTime: 1 });

    const icalAppointments = appointments.map((appointment) => {
      const appointmentTypeLabel = appointment.appointmentType
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      const customerName = (appointment.customerId as any)?.name || "Customer";
      const title = appointment.isPrivate
        ? appointment.title || "Private Appointment"
        : `${appointmentTypeLabel} - ${customerName}`;

      const description = appointment.isPrivate
        ? appointment.description || "Private appointment"
        : appointment.description || `${appointmentTypeLabel} appointment with ${customerName}`;

      const customerEmail = (appointment.customerId as any)?.email || "";

      return {
        id: appointment._id.toString(),
        title,
        description,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        location: "Bellevue Collision Services, 13434 SE 27th Pl, Bellevue WA 98005",
        attendeeEmail: appointment.isPrivate ? "" : customerEmail,
        attendeeName: appointment.isPrivate ? "" : customerName,
        organizerEmail: process.env.BUSINESS_EMAIL || "info@bellevuecollision.com",
        organizerName: "Bellevue Collision Services",
        status: appointment.status,
      };
    });

    const icalData = generateICalFile(icalAppointments);

    // Set headers for .ics file download
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="bellevue-collision-calendar.ics"`);

    res.send(icalData);
  } catch (error) {
    next(error);
  }
};
