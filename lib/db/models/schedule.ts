import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface ISchedule extends Document {
  contact: mongoose.Types.ObjectId;
  lead?: mongoose.Types.ObjectId;
  date: string;
  time: string;
  status: "confirmed" | "proposed" | "cancelled";
  purpose?: string;
  channel?: "inbound" | "outbound";
  confirmationEmailMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    contact: { type: Schema.Types.ObjectId, ref: "Contact", required: true },
    lead: { type: Schema.Types.ObjectId, ref: "Lead" },
    date: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["confirmed", "proposed", "cancelled"],
      default: "confirmed",
    },
    purpose: String,
    channel: { type: String, enum: ["inbound", "outbound"] },
    confirmationEmailMessageId: String,
  },
  { timestamps: true }
);

ScheduleSchema.index({ date: 1, time: 1 });
ScheduleSchema.index({ contact: 1 });

export const Schedule: Model<ISchedule> =
  mongoose.models.Schedule ?? mongoose.model<ISchedule>("Schedule", ScheduleSchema);
