import { Schema, model, Types } from "mongoose";

interface IServiceRecord {
  vehicleId: Types.ObjectId;
  userId: Types.ObjectId; // For quick querying

  // Service details
  serviceType: "collision_repair" | "maintenance" | "inspection" | "detailing" | "painting" | "parts_replacement" | "other";
  description: string;
  serviceDate: Date;

  // Provider info
  providedBy: "bellevue_collision" | "other";
  providerName?: string; // If other

  // Cost info
  cost?: number;
  laborCost?: number;
  partsCost?: number;

  // Vehicle condition
  mileageAtService?: number;

  // Parts and labor
  partsUsed?: Array<{
    partName: string;
    partNumber?: string;
    quantity: number;
    cost?: number;
  }>;

  laborDetails?: Array<{
    description: string;
    hours?: number;
    cost?: number;
  }>;

  // Documentation
  photos?: string[]; // URLs to photos
  documents?: string[]; // URLs to invoices, receipts, etc.

  // Follow-up
  warrantyExpirationDate?: Date;
  nextServiceDue?: Date;
  nextServiceMileage?: number;

  // Links to internal records
  leadId?: Types.ObjectId;
  invoiceId?: Types.ObjectId;
  appointmentId?: Types.ObjectId;

  // Notes
  notes?: string;
  recommendations?: string;

  createdAt: Date;
  updatedAt: Date;
}

const serviceRecordSchema = new Schema<IServiceRecord>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    serviceType: {
      type: String,
      enum: ["collision_repair", "maintenance", "inspection", "detailing", "painting", "parts_replacement", "other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    serviceDate: {
      type: Date,
      required: true,
      index: true,
    },
    providedBy: {
      type: String,
      enum: ["bellevue_collision", "other"],
      required: true,
    },
    providerName: String,
    cost: Number,
    laborCost: Number,
    partsCost: Number,
    mileageAtService: Number,
    partsUsed: [
      {
        partName: { type: String, required: true },
        partNumber: String,
        quantity: { type: Number, required: true },
        cost: Number,
      },
    ],
    laborDetails: [
      {
        description: { type: String, required: true },
        hours: Number,
        cost: Number,
      },
    ],
    photos: [String],
    documents: [String],
    warrantyExpirationDate: Date,
    nextServiceDue: Date,
    nextServiceMileage: Number,
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: "Appointment",
    },
    notes: String,
    recommendations: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
serviceRecordSchema.index({ vehicleId: 1, serviceDate: -1 });
serviceRecordSchema.index({ userId: 1, serviceDate: -1 });
serviceRecordSchema.index({ serviceType: 1, serviceDate: -1 });

const ServiceRecord = model<IServiceRecord>("ServiceRecord", serviceRecordSchema);

export default ServiceRecord;
export type { IServiceRecord };
