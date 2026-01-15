import { Schema, model } from "mongoose";

interface ILead {
  name: string;
  email: string;
  phone: string;
  message: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

const leadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  ipAddress: String,
  userAgent: String,
  createdAt: { type: Date, default: Date.now },
});

export default model<ILead>("Lead", leadSchema);
