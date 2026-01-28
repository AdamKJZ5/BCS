import { Schema, model, Types } from "mongoose";

interface IAppointment {
  customerId: Types.ObjectId;
  leadId?: Types.ObjectId;
  assignedTo?: Types.ObjectId;

  appointmentType: "drop_off" | "pickup" | "consultation" | "estimate" | "inspection";
  title: string;
  description?: string;

  startTime: Date;
  endTime: Date;
  duration: number; // Minutes

  status: "scheduled" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

  isPrivate: boolean;
  visibleToCustomer: boolean;

  reminderSent: boolean;
  reminderSentAt?: Date;
  confirmationSent: boolean;
  followUpSent?: boolean;
  followUpSentAt?: Date;

  vehicleInfo?: {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
  };

  notes?: string;
  cancellationReason?: string;
  createdBy: Types.ObjectId;

  photos?: string[]; // URLs to uploaded photos

  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    leadId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    appointmentType: {
      type: String,
      enum: ["drop_off", "pickup", "consultation", "estimate", "inspection"],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,

    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 15, // Minimum 15 minutes
    },

    status: {
      type: String,
      enum: ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"],
      default: "scheduled",
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },
    visibleToCustomer: {
      type: Boolean,
      default: true,
    },

    reminderSent: {
      type: Boolean,
      default: false,
    },
    reminderSentAt: Date,
    confirmationSent: {
      type: Boolean,
      default: false,
    },
    followUpSent: {
      type: Boolean,
      default: false,
    },
    followUpSentAt: Date,

    vehicleInfo: {
      make: String,
      model: String,
      year: Number,
      vin: String,
    },

    notes: String,
    cancellationReason: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    photos: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
appointmentSchema.index({ customerId: 1, startTime: -1 });
appointmentSchema.index({ assignedTo: 1, startTime: 1 });
appointmentSchema.index({ startTime: 1, endTime: 1 });
appointmentSchema.index({ status: 1, startTime: 1 });

// Validation: endTime must be after startTime
appointmentSchema.pre("save", function () {
  if (this.endTime <= this.startTime) {
    throw new Error("End time must be after start time");
  }
});

const Appointment = model<IAppointment>("Appointment", appointmentSchema);

export default Appointment;
export type { IAppointment };
