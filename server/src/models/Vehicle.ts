import { Schema, model, Types } from "mongoose";

interface IVehicle {
  userId: Types.ObjectId;
  make: string;
  model: string;
  year: number;
  color?: string;
  vin?: string;
  licensePlate?: string;
  nickname?: string; // e.g., "My Red Car", "Work Truck"
  isPrimary: boolean;

  // Service history
  lastServiceDate?: Date;
  mileage?: number;

  // Additional info
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const vehicleSchema = new Schema<IVehicle>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    make: {
      type: String,
      required: true,
    },
    model: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 2,
    },
    color: String,
    vin: {
      type: String,
      sparse: true,
      unique: true,
    },
    licensePlate: String,
    nickname: String,
    isPrimary: {
      type: Boolean,
      default: false,
    },
    lastServiceDate: Date,
    mileage: Number,
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Ensure only one primary vehicle per user
vehicleSchema.pre("save", async function () {
  if (this.isPrimary && this.isModified("isPrimary")) {
    // Unset isPrimary for other vehicles of the same user
    await Vehicle.updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
});

const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;
export type { IVehicle };
