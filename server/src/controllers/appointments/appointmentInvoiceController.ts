/**
 * Appointment Invoice Controller
 * Handles invoice creation from appointments
 */

import { Request, Response, NextFunction } from "express";
import Appointment from "../../models/Appointment";
import Lead from "../../models/Lead";
import Invoice from "../../models/Invoice";
import { AppError } from "../../utils/AppError";
import { sendInvoiceCreatedSMS } from "../../utils/sms";
import logger from "../../utils/logger";

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
        logger.error("Failed to send invoice SMS:", smsError);
      }
    }

    res.status(201).json(populatedInvoice);
  } catch (error) {
    next(error);
  }
};
