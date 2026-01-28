import { Schema, model, Types } from "mongoose";

interface INotification {
  userId: Types.ObjectId;
  type: "appointment" | "invoice" | "payment" | "lead" | "review" | "system";
  title: string;
  message: string;

  // Optional links to related entities
  relatedAppointment?: Types.ObjectId;
  relatedInvoice?: Types.ObjectId;
  relatedLead?: Types.ObjectId;
  relatedEntity?: Types.ObjectId; // Generic field for reviews, etc.

  // Action URL (e.g., "/admin/calendar", "/customer/invoices")
  actionUrl?: string;

  read: boolean;
  readAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["appointment", "invoice", "payment", "lead", "review", "system"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    relatedAppointment: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    relatedInvoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    relatedLead: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
    },
    relatedEntity: {
      type: Schema.Types.ObjectId,
    },
    actionUrl: String,
    read: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

const Notification = model<INotification>("Notification", notificationSchema);

export default Notification;
export type { INotification };
