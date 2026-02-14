import mongoose from "mongoose";
import type { IContact } from "~types/contact.types";

const ContactSchema = new mongoose.Schema<IContact>(
  {
    /* Identity */
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },

    /* Lead qualification */
    intent: {
      type: String,
      enum: ["buyer", "seller", "both"],
      required: true,
    },
    urgency: { type: String, enum: ["low", "medium", "high"] },
    budgetMin: { type: Number },
    budgetMax: { type: Number },
    priceRange: { type: String },
    location: { type: String },
    timeline: { type: String },
    motivation: { type: String },
    readinessScore: { type: Number },

    /* CRM workflow */
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "viewing", "offer", "closed", "lost"],
      default: "new",
      index: true,
    },
    source: { type: String },
    notes: { type: String },
    nextBestAction: { type: String },

    /* Optional */
    tags: [{ type: String }],
    assignedTo: { type: String },
  },
  { timestamps: true, collection: "contacts" }
);

ContactSchema.index({ email: 1 }, { unique: true });
ContactSchema.index({ status: 1, createdAt: -1 });

export const Contact = mongoose.model<IContact>("contacts", ContactSchema);
