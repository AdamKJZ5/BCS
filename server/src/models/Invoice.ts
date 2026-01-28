import { Schema, model, Types } from "mongoose";

interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface IPayment {
  amount: number;
  method: "stripe" | "cash" | "check" | "crypto";
  transactionId?: string;
  paidAt: Date;
  notes?: string;
}

interface IInvoice {
  invoiceNumber: string;
  leadId: Types.ObjectId;
  customerId: Types.ObjectId;
  appointmentId?: Types.ObjectId;

  // Line items
  lineItems: ILineItem[];

  // Amounts
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;

  // Payment tracking
  amountPaid: number;
  amountDue: number;
  status: "draft" | "sent" | "viewed" | "paid" | "partially_paid" | "overdue" | "cancelled";

  // Dates
  issueDate: Date;
  dueDate: Date;
  paidDate?: Date;

  // Payment history
  payments: IPayment[];

  // Additional info
  notes?: string;
  internalNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const lineItemSchema = new Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  unitPrice: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 }
});

const paymentSchema = new Schema({
  amount: { type: Number, required: true, min: 0 },
  method: {
    type: String,
    enum: ["stripe", "cash", "check", "crypto"],
    required: true
  },
  transactionId: String,
  paidAt: { type: Date, default: Date.now },
  notes: String
});

const invoiceSchema = new Schema<IInvoice>({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  leadId: {
    type: Schema.Types.ObjectId,
    ref: "Lead",
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: "Appointment"
  },

  lineItems: {
    type: [lineItemSchema],
    required: true,
    validate: {
      validator: (items: ILineItem[]) => items.length > 0,
      message: "Invoice must have at least one line item"
    }
  },

  subtotal: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxAmount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },

  amountPaid: { type: Number, default: 0, min: 0 },
  amountDue: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["draft", "sent", "viewed", "paid", "partially_paid", "overdue", "cancelled"],
    default: "draft"
  },

  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paidDate: Date,

  payments: [paymentSchema],

  notes: String,
  internalNotes: String
}, {
  timestamps: true
});

// Generate invoice number automatically
invoiceSchema.pre("save", async function() {
  if (!this.invoiceNumber) {
    const count = await Invoice.countDocuments();
    const year = new Date().getFullYear();
    const invoiceNum = count + 1;
    this.invoiceNumber = `INV-${year}-${String(invoiceNum).padStart(4, '0')}`;
  }
});

const Invoice = model<IInvoice>("Invoice", invoiceSchema);

export default Invoice;
export type { IInvoice, ILineItem, IPayment };
