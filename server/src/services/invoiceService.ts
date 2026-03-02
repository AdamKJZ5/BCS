/**
 * Invoice Service
 * Business logic layer for invoice operations
 */

import Invoice from "../models/Invoice";
import Lead from "../models/Lead";
import Appointment from "../models/Appointment";
import { AppError } from "../utils/AppError";

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}

export interface CreateInvoiceParams {
  customerId: string;
  leadId?: string;
  appointmentId?: string;
  lineItems: LineItem[];
  taxRate?: number;
  dueInDays?: number;
  notes?: string;
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(lineItems: LineItem[], taxRate: number = 0) {
  const subtotal = lineItems.reduce((sum, item) => {
    return sum + item.quantity * item.unitPrice;
  }, 0);

  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  return {
    subtotal,
    taxRate,
    taxAmount,
    total,
  };
}

/**
 * Create invoice from line items
 */
export async function createInvoice(params: CreateInvoiceParams) {
  const {
    customerId,
    leadId,
    appointmentId,
    lineItems,
    taxRate = 0,
    dueInDays = 30,
    notes,
  } = params;

  if (!lineItems || lineItems.length === 0) {
    throw new AppError("Line items are required", 400);
  }

  // Calculate totals
  const { subtotal, taxAmount, total } = calculateInvoiceTotals(lineItems, taxRate);

  // Calculate due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueInDays);

  // Create invoice
  const invoice = await Invoice.create({
    leadId,
    customerId,
    appointmentId,
    lineItems: lineItems.map((item) => ({
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

  return invoice;
}

/**
 * Create or update lead from appointment
 */
export async function createOrUpdateLeadFromAppointment(
  appointment: any,
  finalAmount: number
) {
  let lead = appointment.leadId;

  if (!lead) {
    // Create a new lead from appointment
    const leadData: any = {
      name: appointment.customerId.name,
      email: appointment.customerId.email,
      phone: appointment.customerId.phone || "",
      message: `Repair from ${appointment.appointmentType.replace(/_/g, " ")} appointment`,
      userId: appointment.customerId._id,
      appointmentId: appointment._id,
      repairStage: "completed",
      status: "contacted",
      finalAmount,
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
    lead.finalAmount = finalAmount;
    lead.repairStage = "completed";
    lead.appointmentId = appointment._id;
    await lead.save();
  }

  return lead;
}

/**
 * Calculate invoice payment status
 */
export function calculatePaymentStatus(invoice: any): string {
  if (invoice.amountDue === 0) {
    return "paid";
  }

  if (invoice.payments && invoice.payments.length > 0) {
    const totalPaid = invoice.payments.reduce((sum: number, payment: any) => {
      return payment.status === "succeeded" ? sum + payment.amount : sum;
    }, 0);

    if (totalPaid >= invoice.total) {
      return "paid";
    } else if (totalPaid > 0) {
      return "partially_paid";
    }
  }

  // Check if overdue
  if (invoice.dueDate && new Date() > new Date(invoice.dueDate)) {
    return "overdue";
  }

  return invoice.status || "sent";
}

/**
 * Process invoice payment
 */
export async function processInvoicePayment(
  invoiceId: string,
  paymentAmount: number,
  paymentMethod: string
) {
  const invoice = await Invoice.findById(invoiceId);

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  if (invoice.amountDue <= 0) {
    throw new AppError("Invoice is already paid", 400);
  }

  // Update amount due
  invoice.amountDue = Math.max(0, invoice.amountDue - paymentAmount);

  // Update status
  if (invoice.amountDue === 0) {
    invoice.status = "paid";
  } else {
    invoice.status = "partially_paid";
  }

  await invoice.save();

  return invoice;
}

/**
 * Get invoice summary statistics
 */
export async function getInvoiceStats(filters?: {
  startDate?: Date;
  endDate?: Date;
  customerId?: string;
}) {
  const query: any = {};

  if (filters?.startDate || filters?.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = filters.startDate;
    }
    if (filters.endDate) {
      query.createdAt.$lte = filters.endDate;
    }
  }

  if (filters?.customerId) {
    query.customerId = filters.customerId;
  }

  const invoices = await Invoice.find(query);

  const stats = {
    total: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    totalPaid: invoices.reduce((sum, inv) => sum + (inv.total - inv.amountDue), 0),
    totalOutstanding: invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
    byStatus: {
      sent: invoices.filter((i) => i.status === "sent").length,
      paid: invoices.filter((i) => i.status === "paid").length,
      overdue: invoices.filter((i) => i.status === "overdue").length,
      partially_paid: invoices.filter((i) => i.status === "partially_paid").length,
    },
  };

  return stats;
}
