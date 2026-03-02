/**
 * Shared utilities for appointment controllers
 */

import Appointment from "../../models/Appointment";
import User from "../../models/User";

/**
 * Auto-assign to employee with fewest appointments
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
    return undefined; // No admins available
  }

  return counts[0]!.adminId.toString();
}

/**
 * Generate time slots for a day
 */
export function generateTimeSlots(
  date: Date,
  startTimeStr: string,
  endTimeStr: string,
  duration: number,
  buffer: number
): Array<{ startTime: Date; endTime: Date }> {
  const slots: Array<{ startTime: Date; endTime: Date }> = [];

  const startTimeParts = startTimeStr.split(":").map(Number);
  const endTimeParts = endTimeStr.split(":").map(Number);

  const startHour = startTimeParts[0];
  const startMin = startTimeParts[1];
  const endHour = endTimeParts[0];
  const endMin = endTimeParts[1];

  // Validate time format
  if (startHour === undefined || startMin === undefined || endHour === undefined || endMin === undefined) {
    return slots; // Return empty array if invalid time format
  }

  const slotDuration = duration + buffer; // Total time including buffer

  let current = new Date(date);
  current.setHours(startHour, startMin, 0, 0);

  const end = new Date(date);
  end.setHours(endHour, endMin, 0, 0);

  while (current < end) {
    const slotStart = new Date(current);
    const slotEnd = new Date(current.getTime() + duration * 60000); // duration in minutes

    // Only add if slot end is before business hours end
    if (slotEnd <= end) {
      slots.push({
        startTime: slotStart,
        endTime: slotEnd,
      });
    }

    current = new Date(current.getTime() + slotDuration * 60000);
  }

  return slots;
}
