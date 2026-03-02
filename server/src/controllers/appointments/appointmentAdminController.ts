import { Request, Response, NextFunction } from "express";
import Appointment from "../../models/Appointment";
import User from "../../models/User";
import Settings from "../../models/Settings";
import Lead from "../../models/Lead";
import Invoice from "../../models/Invoice";
import { AppError } from "../../utils/AppError";
import { sendAppointmentConfirmation } from "../../utils/email";
import { sendAppointmentStatusSMS, sendInvoiceCreatedSMS } from "../../utils/sms";
import { createNotification, notifyAllAdmins } from "../../utils/createNotification";
import logger from "../../utils/logger";
import { autoAssignEmployee } from "./appointmentUtils";

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
        logger.error("Failed to send status SMS:", smsError);
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
        logger.error("Failed to send notification:", notifError);
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
