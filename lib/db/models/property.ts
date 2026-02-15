import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface IProperty extends Document {
  address: string;
  city: string;
  state: string;
  zip?: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  property_type?: "single_family" | "condo" | "townhouse" | "multi_family" | "land";
  description?: string;
  features?: string[];
  images?: string[];
  status?: "active" | "sold" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zip: String,
    price: { type: Number, required: true },
    beds: { type: Number, required: true },
    baths: { type: Number, required: true },
    sqft: Number,
    property_type: {
      type: String,
      enum: ["single_family", "condo", "townhouse", "multi_family", "land"],
    },
    description: String,
    features: [String],
    images: [String],
    status: { type: String, enum: ["active", "sold", "archived"], default: "active" },
  },
  { timestamps: true }
);

export const Property: Model<IProperty> =
  mongoose.models.Property ?? mongoose.model<IProperty>("Property", PropertySchema);
