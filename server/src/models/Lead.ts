import { Schema, model, Types } from "mongoose";

interface IProgressNote {
  note: string;
  createdBy: string;
  createdAt: Date;
}

interface ILead {
  name: string;
  email: string;
  phone: string;
  message: string;
  damageDescription?: string;
  photos?: string[];
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
  archived?: boolean;
  archivedAt?: Date;
  status?: "new" | "contacted" | "closed";

  // Customer portal fields
  userId?: Types.ObjectId;
  appointmentId?: Types.ObjectId;

  // Repair tracking fields
  repairStage?: "pending" | "assessment" | "parts_ordered" | "in_progress" | "quality_check" | "completed";
  partsStatus?: "not_needed" | "ordering" | "ordered" | "in_transit" | "received" | "installed";
  estimatedCompletionDate?: Date;
  actualCompletionDate?: Date;
  progressNotes?: IProgressNote[];

  // Additional tracking
  estimateAmount?: number;
  finalAmount?: number;
  insuranceClaimNumber?: string;
  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    color?: string;
    vin?: string;
  };
}

const progressNoteSchema = new Schema({
  note: { type: String, required: true },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const leadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  damageDescription: { type: String },
  photos: [String],
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
  archived: {
    type: Boolean,
    default: false,
  },
  archivedAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["new", "contacted", "closed"],
    default: "new",
  },

  // Customer portal fields
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  appointmentId: {
    type: Schema.Types.ObjectId,
    ref: "Appointment",
  },

  // Repair tracking fields
  repairStage: {
    type: String,
    enum: ["pending", "assessment", "parts_ordered", "in_progress", "quality_check", "completed"],
    default: "pending",
  },
  partsStatus: {
    type: String,
    enum: ["not_needed", "ordering", "ordered", "in_transit", "received", "installed"],
    default: "not_needed",
  },
  estimatedCompletionDate: Date,
  actualCompletionDate: Date,
  progressNotes: [progressNoteSchema],

  // Additional tracking
  estimateAmount: Number,
  finalAmount: Number,
  insuranceClaimNumber: String,
  vehicleInfo: {
    make: String,
    model: String,
    year: Number,
    color: String,
    vin: String,
  },
});

export default model<ILead>("Lead", leadSchema);
