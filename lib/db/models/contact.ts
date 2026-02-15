import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IContact extends Document {
  name?: string;
  phone?: string;
  email?: string;
  source?: "inbound" | "outbound";
  createdAt: Date;
  updatedAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    name: String,
    phone: String,
    email: String,
    source: { type: String, enum: ["inbound", "outbound"] },
  },
  { timestamps: true }
);

export const Contact: Model<IContact> =
  mongoose.models.Contact ?? mongoose.model<IContact>("Contact", ContactSchema);
