import mongoose from "mongoose";
import type { IProperty } from "~/types/property.types.ts";

const PropertySchema = new mongoose.Schema<IProperty>(
  {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    zip: { type: String },
    beds: { type: Number },
    baths: { type: Number },
    sqft: { type: Number },
    price: { type: Number },
    priceExpectation: { type: Number },
    condition: { type: String },
    timeline: { type: String },
    source: {
      type: String,
      enum: ["listing", "seller_inquiry"],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["inquiry", "qualified", "listed", "sold", "off_market"],
      default: "inquiry",
      index: true,
    },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "contacts", index: true },
  },
  { timestamps: true, collection: "properties" }
);


export const Property = mongoose.model<IProperty>("properties", PropertySchema);
