/**
 * Appointment Service
 * Business logic layer for appointment operations
 */

import Appointment from "../models/Appointment";
import User from "../models/User";
import Settings from "../models/Settings";
import { AppError } from "../utils/AppError";
import logger from "../utils/logger";

/**
 * Check if a time slot is available
 */
export async function checkTimeSlotAvailability(
  startTime: Date,
  endTime: Date,
  employeeId?: string
): Promise<boolean> {
  const query: any = {
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    status: { $in: ["scheduled", "confirmed", "in_progress"] },
  };

  if (employeeId) {
    query.assignedTo = employeeId;
  }

  const conflicts = await Appointment.find(query);
  return conflicts.length === 0;
}

/**
 * Auto-assign appointment to employee with fewest appointments
 */
export async function autoAssignEmployee(): Promise<string | undefined> {
  const admins = await User.find({ role: "admin" });

  if (admins.length === 0) {
    return undefined;
  }

  // Get appointment counts for each admin
  const counts = await Promise.all(
    admins.map(async (admin) => {
      const count = await Appointment.countDocuments({
        assignedTo: admin._id,
        status: { $in: ["scheduled", "confirmed", "in_progress"] },
      });
      return { adminId: admin._id, count };
    })
  );

  // Sort by count and return admin with fewest
  counts.sort((a, b) => a.count - b.count);

  if (counts.length === 0) {
    return undefined;
  }

  return counts[0]!.adminId.toString();
}

/**
 * Validate appointment booking against business rules
 */
export async function validateAppointmentBooking(params: {
  startTime: Date;
  duration: number;
  appointmentType: string;
}): Promise<{ valid: boolean; message?: string }> {
  const { startTime, duration } = params;

  // Get settings
  const settings = await Settings.findOne();
  if (!settings || !settings.appointmentSettings.enabled) {
    return {
      valid: false,
      message: "Appointment booking is currently disabled",
    };
  }

  const { appointmentSettings } = settings;
  const now = new Date();

  // Check if date is in the past
  if (startTime < now) {
    return {
      valid: false,
      message: "Cannot book appointments in the past",
    };
  }

  // Check max advance booking
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + appointmentSettings.maxAdvanceBooking);
  if (startTime > maxDate) {
    return {
      valid: false,
      message: `Cannot book more than ${appointmentSettings.maxAdvanceBooking} days in advance`,
    };
  }

  // Check min advance booking
  const minDate = new Date();
  minDate.setHours(minDate.getHours() + appointmentSettings.minAdvanceBooking);
  if (startTime < minDate) {
    return {
      valid: false,
      message: `Appointments must be booked at least ${appointmentSettings.minAdvanceBooking} hours in advance`,
    };
  }

  // Check business hours
  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayName = dayNames[startTime.getDay()] as keyof typeof appointmentSettings.businessHours;
  const dayConfig = appointmentSettings.businessHours[dayName];

  if (!dayConfig.enabled) {
    return {
      valid: false,
      message: "No appointments available on this day",
    };
  }

  // Check blockouts
  const isBlocked = appointmentSettings.blockouts.some((blockout) => {
    const blockoutDate = new Date(blockout.date);
    return (
      blockoutDate.getFullYear() === startTime.getFullYear() &&
      blockoutDate.getMonth() === startTime.getMonth() &&
      blockoutDate.getDate() === startTime.getDate()
    );
  });

  if (isBlocked) {
    return {
      valid: false,
      message: "No appointments available on this day (holiday/closed)",
    };
  }

  // Check time slot availability
  const endTime = new Date(startTime.getTime() + duration * 60000);
  const isAvailable = await checkTimeSlotAvailability(startTime, endTime);

  if (!isAvailable) {
    return {
      valid: false,
      message: "Time slot no longer available",
    };
  }

  return { valid: true };
}

/**
 * Check if appointment can be cancelled
 */
export function canCancelAppointment(appointment: any): { canCancel: boolean; reason?: string } {
  // Check if already cancelled or completed
  if (["cancelled", "completed", "no_show"].includes(appointment.status)) {
    return {
      canCancel: false,
      reason: "Cannot cancel this appointment",
    };
  }

  // Check if within cancellation window (24 hours)
  const hoursDiff = (appointment.startTime.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  if (hoursDiff < 24) {
    return {
      canCancel: false,
      reason: "Cannot cancel within 24 hours of appointment",
    };
  }

  return { canCancel: true };
}

/**
 * Calculate appointment statistics
 */
export async function calculateAppointmentStats(filters?: {
  startDate?: Date;
  endDate?: Date;
  employeeId?: string;
}) {
  const query: any = {};

  if (filters?.startDate || filters?.endDate) {
    query.startTime = {};
    if (filters.startDate) {
      query.startTime.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.startTime.$lte = filters.endDate;
    }
  }

  if (filters?.employeeId) {
    query.assignedTo = filters.employeeId;
  }

  // Get all appointments matching filters
  const allAppointments = await Appointment.find(query);

  // Calculate stats
  const stats = {
    total: allAppointments.length,
    scheduled: allAppointments.filter((a) => a.status === "scheduled").length,
    confirmed: allAppointments.filter((a) => a.status === "confirmed").length,
    inProgress: allAppointments.filter((a) => a.status === "in_progress").length,
    completed: allAppointments.filter((a) => a.status === "completed").length,
    cancelled: allAppointments.filter((a) => a.status === "cancelled").length,
    noShow: allAppointments.filter((a) => a.status === "no_show").length,
  };

  // Group by type
  const byType: Record<string, number> = {};
  allAppointments.forEach((apt) => {
    byType[apt.appointmentType] = (byType[apt.appointmentType] || 0) + 1;
  });

  // Group by week
  const byWeek: Record<string, number> = {};
  allAppointments.forEach((apt) => {
    const week = getWeekKey(apt.startTime);
    byWeek[week] = (byWeek[week] || 0) + 1;
  });

  return {
    stats,
    byType,
    byWeek,
  };
}

/**
 * Helper: Get week key for grouping (YYYY-Www format)
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const firstDayOfYear = new Date(year, 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

/**
 * Get upcoming appointments for reminders
 */
export async function getUpcomingAppointmentsForReminders(hoursAhead: number = 24) {
  const now = new Date();
  const reminderTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);

  const appointments = await Appointment.find({
    startTime: {
      $gte: now,
      $lte: reminderTime,
    },
    status: { $in: ["scheduled", "confirmed"] },
    reminderSent: { $ne: true },
  })
    .populate("customerId", "name email phone")
    .populate("assignedTo", "name email");

  return appointments;
}

/**
 * Mark appointment reminder as sent
 */
export async function markReminderSent(appointmentId: string) {
  try {
    await Appointment.findByIdAndUpdate(appointmentId, {
      reminderSent: true,
    });
  } catch (error) {
    logger.error(`Failed to mark reminder as sent for appointment ${appointmentId}:`, error);
  }
}
