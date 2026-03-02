/**
 * Appointment Availability Controller
 * Handles checking available time slots for appointments
 */

import { Request, Response, NextFunction } from "express";
import Appointment from "../../models/Appointment";
import Settings from "../../models/Settings";
import { AppError } from "../../utils/AppError";
import { generateTimeSlots } from "./appointmentUtils";

/**
 * Get available time slots for a given date
 */
export const getAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { date, duration = 60, employeeId } = req.query;

    if (!date) {
      throw new AppError("Date is required", 400);
    }

    const requestedDate = new Date(date as string);
    const now = new Date();

    // Check if date is in the past
    if (requestedDate < new Date(now.setHours(0, 0, 0, 0))) {
      throw new AppError("Cannot book appointments in the past", 400);
    }

    // Get settings
    const settings = await Settings.findOne();
    if (!settings || !settings.appointmentSettings.enabled) {
      throw new AppError("Appointment booking is currently disabled", 400);
    }

    const { appointmentSettings } = settings;

    // Check max advance booking
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + appointmentSettings.maxAdvanceBooking);
    if (requestedDate > maxDate) {
      throw new AppError(
        `Cannot book more than ${appointmentSettings.maxAdvanceBooking} days in advance`,
        400
      );
    }

    // Check min advance booking
    const minDate = new Date();
    minDate.setHours(minDate.getHours() + appointmentSettings.minAdvanceBooking);
    if (requestedDate < minDate) {
      throw new AppError(
        `Appointments must be booked at least ${appointmentSettings.minAdvanceBooking} hours in advance`,
        400
      );
    }

    // Get day of week
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = dayNames[requestedDate.getDay()] as keyof typeof appointmentSettings.businessHours;
    const dayConfig = appointmentSettings.businessHours[dayName];

    // Check if day is enabled
    if (!dayConfig.enabled) {
      return res.json({
        success: true,
        availableSlots: [],
        message: "No appointments available on this day",
      });
    }

    // Check blockouts
    const isBlocked = appointmentSettings.blockouts.some((blockout) => {
      const blockoutDate = new Date(blockout.date);
      return (
        blockoutDate.getFullYear() === requestedDate.getFullYear() &&
        blockoutDate.getMonth() === requestedDate.getMonth() &&
        blockoutDate.getDate() === requestedDate.getDate()
      );
    });

    if (isBlocked) {
      return res.json({
        success: true,
        availableSlots: [],
        message: "No appointments available on this day (holiday/closed)",
      });
    }

    // Generate time slots
    const slots = generateTimeSlots(
      requestedDate,
      dayConfig.start,
      dayConfig.end,
      duration ? Number(duration) : 60,
      appointmentSettings.bufferTime
    );

    // Get existing appointments
    const startOfDay = new Date(requestedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(requestedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const query: any = {
      startTime: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["scheduled", "confirmed", "in_progress"] },
    };

    if (employeeId) {
      query.assignedTo = employeeId;
    }

    const existingAppointments = await Appointment.find(query);

    // Filter out conflicting slots
    const availableSlots = slots.filter((slot) => {
      return !existingAppointments.some((apt) => {
        return slot.startTime < apt.endTime && slot.endTime > apt.startTime;
      });
    });

    res.json({
      success: true,
      availableSlots,
      date: requestedDate,
    });
  } catch (error) {
    next(error);
  }
};
