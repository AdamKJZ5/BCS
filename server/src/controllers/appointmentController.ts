import { Request, Response, NextFunction } from "express";
import Appointment from "../models/Appointment";
import User from "../models/User";
import Settings from "../models/Settings";
import Lead from "../models/Lead";
import Invoice from "../models/Invoice";
import { AppError } from "../utils/AppError";
import { sendAppointmentConfirmation } from "../utils/email";
import { sendAppointmentStatusSMS, sendInvoiceCreatedSMS } from "../utils/sms";
import { createNotification, notifyAllAdmins } from "../utils/createNotification";
import { generateSingleAppointmentICalFile, generateICalFile } from "../utils/icalGenerator";

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

/**
 * Generate time slots for a day
 */
function generateTimeSlots(
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
        console.error("Failed to send confirmation email:", emailError);
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
        console.error("Failed to send notification:", notifError);
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
 * Auto-assign to employee with fewest appointments
 */
async function autoAssignEmployee(): Promise<string | undefined> {
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

// Admin endpoints

/**
 * Get all appointments (admin)
 */
export const getAllAppointments = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const { status, employeeId, startDate, endDate, appointmentType, search, sortBy, sortOrder } = req.query;

    const query: any = {};

    // Filter by status
    if (status && status !== "all") {
      query.status = status;
    }

    // Filter by appointment type
    if (appointmentType && appointmentType !== "all") {
      query.appointmentType = appointmentType;
    }

    // Filter by assigned employee
    if (employeeId && employeeId !== "all") {
      query.assignedTo = employeeId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate as string);
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        query.startTime.$lte = end;
      }
    }

    // Fetch appointments with customer info for search
    let appointments: any[] = [];

    if (search) {
      // If searching, we need to populate first then filter
      const searchRegex = new RegExp(search as string, "i");
      const allAppointments = await Appointment.find(query)
        .populate("customerId", "name email phone")
        .populate("assignedTo", "name email")
        .populate("leadId", "damageDescription vehicleInfo")
        .lean();

      // Filter by customer name/email/phone or description
      appointments = allAppointments.filter((apt: any) => {
        return (
          (apt.customerId?.name && searchRegex.test(apt.customerId.name)) ||
          (apt.customerId?.email && searchRegex.test(apt.customerId.email)) ||
          (apt.customerId?.phone && searchRegex.test(apt.customerId.phone)) ||
          (apt.description && searchRegex.test(apt.description)) ||
          (apt.title && searchRegex.test(apt.title))
        );
      });

      const total = appointments.length;

      // Apply pagination and sorting manually
      let sortField = sortBy as string || "startTime";
      let sortDir = sortOrder === "asc" ? 1 : -1;

      appointments.sort((a: any, b: any) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal) return -sortDir;
        if (aVal > bVal) return sortDir;
        return 0;
      });

      appointments = appointments.slice(skip, skip + limit);

      return res.json({
        success: true,
        appointments,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit),
        },
        filters: {
          search: search || "",
          status: status || "all",
          appointmentType: appointmentType || "all",
          employeeId: employeeId || "all",
          startDate: startDate || "",
          endDate: endDate || "",
          sortBy: sortBy || "startTime",
          sortOrder: sortOrder || "desc",
        },
      });
    }

    // No search - use standard query
    let sortOption: any = { startTime: 1 };
    if (sortBy) {
      const sortDirection = sortOrder === "asc" ? 1 : -1;
      sortOption = { [sortBy as string]: sortDirection };
    }

    const [appointmentsData, total] = await Promise.all([
      Appointment.find(query)
        .populate("customerId", "name email phone")
        .populate("assignedTo", "name email")
        .populate("leadId", "damageDescription vehicleInfo")
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(query),
    ]);

    res.json({
      success: true,
      appointments: appointmentsData,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
      filters: {
        search: search || "",
        status: status || "all",
        appointmentType: appointmentType || "all",
        employeeId: employeeId || "all",
        startDate: startDate || "",
        endDate: endDate || "",
        sortBy: sortBy || "startTime",
        sortOrder: sortOrder || "desc",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get calendar view (admin)
 */
export const getCalendarView = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, employeeId, includePrivate = "true" } = req.query;

    if (!startDate || !endDate) {
      throw new AppError("Start date and end date are required", 400);
    }

    const query: any = {
      startTime: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    };

    if (employeeId) {
      query.assignedTo = employeeId;
    }

    if (includePrivate === "false") {
      query.isPrivate = false;
    }

    const appointments = await Appointment.find(query)
      .populate("customerId", "name email phone")
      .populate("assignedTo", "name email")
      .populate("leadId", "damageDescription vehicleInfo")
      .sort({ startTime: 1 });

    // Get all admin users for filter
    const employees = await User.find({ role: "admin" }, "name email");

    res.json({
      success: true,
      appointments,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointments by employee (admin)
 */
export const getAppointmentsByEmployee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { employeeId } = req.params;

    const appointments = await Appointment.find({ assignedTo: employeeId as any })
      .populate("customerId", "name email phone")
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
 * Create appointment (admin - can create for any customer)
 */
export const createAdminAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = (req as any).user?.id;

    const {
      customerId,
      leadId,
      assignedTo,
      appointmentType,
      title,
      description,
      startTime,
      endTime,
      duration,
      isPrivate,
      vehicleInfo,
      notes,
    } = req.body;

    if (!startTime || !endTime) {
      throw new AppError("Start time and end time are required", 400);
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check for conflicts
    const conflictQuery: any = {
      startTime: { $lt: end },
      endTime: { $gt: start },
      status: { $in: ["scheduled", "confirmed", "in_progress"] },
    };

    if (assignedTo) {
      conflictQuery.assignedTo = assignedTo as any;
    }

    const conflicts = await Appointment.find(conflictQuery);

    if (conflicts.length > 0) {
      throw new AppError("Time slot conflicts with existing appointment", 409);
    }

    const assignedToId = assignedTo || (await autoAssignEmployee());

    const appointmentData: any = {
      customerId: customerId || adminId,
      leadId,
      appointmentType: appointmentType || "consultation",
      title: title || "Admin Created Appointment",
      description,
      startTime: start,
      endTime: end,
      duration: duration || Math.round((end.getTime() - start.getTime()) / 60000),
      vehicleInfo,
      notes,
      isPrivate: isPrivate || false,
      visibleToCustomer: !isPrivate,
      createdBy: adminId,
    };

    if (assignedToId) {
      appointmentData.assignedTo = assignedToId;
    }

    const appointment = await Appointment.create(appointmentData);

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customerId", "name email phone")
      .populate("assignedTo", "name email");

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
 * Assign appointment to employee (admin)
 */
export const assignAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { assignedTo } = req.body;

    if (!assignedTo) {
      throw new AppError("Employee ID is required", 400);
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Check if employee exists and is admin
    const employee = await User.findOne({ _id: assignedTo, role: "admin" });
    if (!employee) {
      throw new AppError("Employee not found or not an admin", 404);
    }

    appointment.assignedTo = assignedTo;
    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customerId", "name email phone")
      .populate("assignedTo", "name email");

    res.json({
      success: true,
      message: "Appointment assigned successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update appointment status (admin)
 */
export const updateAppointmentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { status, notes, cancellationReason } = req.body;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    const oldStatus = appointment.status;

    if (status) {
      appointment.status = status;
    }

    if (notes) {
      appointment.notes = notes;
    }

    if (cancellationReason) {
      appointment.cancellationReason = cancellationReason;
    }

    await appointment.save();

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("customerId", "name email phone")
      .populate("assignedTo", "name email");

    // Send SMS notification if status changed
    if (status && status !== oldStatus && populatedAppointment) {
      try {
        await sendAppointmentStatusSMS(populatedAppointment, status);
      } catch (smsError) {
        console.error("Failed to send status SMS:", smsError);
        // Don't fail the request if SMS fails
      }

      // Create in-app notification for customer
      try {
        const statusMessages: Record<string, string> = {
          confirmed: "Your appointment has been confirmed",
          in_progress: "Your appointment is now in progress",
          completed: "Your appointment has been completed",
          cancelled: "Your appointment has been cancelled",
        };

        if (statusMessages[status]) {
          const formattedDate = new Date(populatedAppointment.startTime).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });

          const customerId = (populatedAppointment.customerId as any)._id || populatedAppointment.customerId;
          await createNotification({
            userId: customerId,
            type: "appointment",
            title: "Appointment Status Updated",
            message: `${statusMessages[status]} for ${formattedDate}`,
            relatedAppointment: populatedAppointment._id,
            actionUrl: "/customer/dashboard",
          });
        }
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }
    }

    res.json({
      success: true,
      message: "Appointment updated successfully",
      appointment: populatedAppointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get appointment statistics (admin)
 */
export const getAppointmentStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalAppointments,
      todayAppointments,
      weekAppointments,
      monthAppointments,
      upcomingAppointments,
      cancelledCount,
      noShowCount,
    ] = await Promise.all([
      Appointment.countDocuments(),
      Appointment.countDocuments({
        startTime: { $gte: startOfToday, $lte: endOfToday },
      }),
      Appointment.countDocuments({
        startTime: { $gte: startOfWeek },
      }),
      Appointment.countDocuments({
        startTime: { $gte: startOfMonth },
      }),
      Appointment.countDocuments({
        startTime: { $gte: now },
        status: { $in: ["scheduled", "confirmed"] },
      }),
      Appointment.countDocuments({ status: "cancelled" }),
      Appointment.countDocuments({ status: "no_show" }),
    ]);

    res.json({
      success: true,
      stats: {
        total: totalAppointments,
        today: todayAppointments,
        thisWeek: weekAppointments,
        thisMonth: monthAppointments,
        upcoming: upcomingAppointments,
        cancelled: cancelledCount,
        noShows: noShowCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create invoice from completed appointment
 */
export const createInvoiceFromAppointment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { lineItems, taxRate = 0, dueInDays = 30, notes } = req.body;

    if (!lineItems || lineItems.length === 0) {
      throw new AppError("Line items are required to create an invoice", 400);
    }

    // Find appointment
    const appointment = await Appointment.findById(id)
      .populate("customerId")
      .populate("leadId");

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    if (appointment.status !== "completed") {
      throw new AppError("Can only create invoice from completed appointments", 400);
    }

    if (!appointment.customerId) {
      throw new AppError("Appointment must have a customer", 400);
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => {
      return sum + item.quantity * item.unitPrice;
    }, 0);

    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    // Create or update lead
    let lead = appointment.leadId as any;

    if (!lead) {
      // Create a new lead from appointment
      const leadData: any = {
        name: (appointment.customerId as any).name,
        email: (appointment.customerId as any).email,
        phone: (appointment.customerId as any).phone || "",
        message: `Repair from ${appointment.appointmentType.replace(/_/g, " ")} appointment`,
        userId: appointment.customerId._id,
        appointmentId: appointment._id,
        repairStage: "completed",
        status: "contacted",
        finalAmount: total,
      };

      if (appointment.vehicleInfo) {
        leadData.vehicleInfo = appointment.vehicleInfo;
      }

      lead = await Lead.create(leadData);

      // Link appointment to lead
      appointment.leadId = lead._id;
      await appointment.save();
    } else {
      // Update existing lead
      lead.finalAmount = total;
      lead.repairStage = "completed";
      lead.appointmentId = appointment._id;
      await lead.save();
    }

    // Create invoice
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueInDays);

    const invoice = await Invoice.create({
      leadId: lead._id,
      customerId: appointment.customerId._id,
      appointmentId: appointment._id,
      lineItems: lineItems.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
      })),
      subtotal,
      taxRate,
      taxAmount,
      total,
      amountDue: total,
      status: "sent",
      dueDate,
      notes,
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate("leadId")
      .populate("customerId")
      .populate("appointmentId");

    // Send SMS notification about new invoice
    if (populatedInvoice) {
      try {
        await sendInvoiceCreatedSMS(populatedInvoice);
      } catch (smsError) {
        console.error("Failed to send invoice SMS:", smsError);
      }
    }

    res.status(201).json(populatedInvoice);
  } catch (error) {
    next(error);
  }
};

/**
 * Upload photos to an appointment
 */
export const uploadAppointmentPhotos = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Check authorization: customer must own the appointment, or user must be admin
    if (userRole !== "admin" && appointment.customerId.toString() !== userId) {
      throw new AppError("Not authorized to upload photos to this appointment", 403);
    }

    // Get uploaded files from multer
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }

    // Generate URLs for the uploaded files
    const photoUrls = files.map((file) => {
      return `/uploads/appointments/${file.filename}`;
    });

    // Add photos to appointment
    if (!appointment.photos) {
      appointment.photos = [];
    }
    appointment.photos.push(...photoUrls);
    await appointment.save();

    res.json({
      success: true,
      message: `${files.length} photo(s) uploaded successfully`,
      photos: photoUrls,
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a photo from an appointment
 */
export const deleteAppointmentPhoto = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id, photoIndex } = req.params;
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Check authorization
    if (userRole !== "admin" && appointment.customerId.toString() !== userId) {
      throw new AppError("Not authorized to delete photos from this appointment", 403);
    }

    if (!appointment.photos || appointment.photos.length === 0) {
      throw new AppError("No photos found for this appointment", 404);
    }

    if (!photoIndex || typeof photoIndex !== "string") {
      throw new AppError("Photo index is required", 400);
    }

    const index = parseInt(photoIndex as string);
    if (isNaN(index) || index < 0 || index >= appointment.photos.length) {
      throw new AppError("Invalid photo index", 400);
    }

    // Remove photo URL from array
    const [removedPhoto] = appointment.photos.splice(index, 1);
    await appointment.save();

    // Optionally delete the file from disk
    // Note: We keep the file on disk in case other records reference it
    // If you want to delete: fs.unlinkSync(path.join(__dirname, '../../', removedPhoto));

    res.json({
      success: true,
      message: "Photo deleted successfully",
      appointment,
    });
  } catch (error) {
    next(error);
  }
};

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
