import { Schema, model } from "mongoose";

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
}

const leadSchema = new Schema<ILead>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  message: { type: String, required: true },
  damageDescription: { type:String },
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
    enum:["new", "contacted", "closed"],
    default: "new",
  },
});

export default model<ILead>("Lead", leadSchema);
