import mongoose, { Schema, type Document, type Model } from "mongoose";

export interface LeadMemory {
  preferences?: {
    must_have?: string[];
    deal_breakers?: string[];
    preferred_areas?: string[];
  };
  property_interests?: string[];
  objections_raised?: string[];
  financing_context?: string;
  last_topic?: string;
  notes?: string[];
}

export interface ILead extends Document {
  name?: string;
  phone?: string;
  email?: string;
  status: string;
  budget?: number;
  location?: string;
  timeline?: string;
  intent?: string;
  urgency?: string;
  readiness_score?: number;
  memory?: LeadMemory;
  suggested_properties?: mongoose.Types.ObjectId[];
  next_action?: string;
  call_insights?: {
    summary?: string;
    objections?: string[];
    action_items?: string[];
    next_best_action?: string;
  };
  appointments?: Array<{
    date: string;
    time: string;
    confirmed?: boolean;
    channel?: "inbound" | "outbound";
    purpose?: string;
  }>;
  motivation?: string;
  channel?: "inbound" | "outbound";
  createdAt: Date;
  updatedAt: Date;
}

const LeadMemorySchema = new Schema<LeadMemory>(
  {
    preferences: {
      must_have: [String],
      deal_breakers: [String],
      preferred_areas: [String],
    },
    property_interests: [String],
    objections_raised: [String],
    financing_context: String,
    last_topic: String,
    notes: [String],
  },
  { _id: false }
);

const LeadSchema = new Schema<ILead>(
  {
    name: String,
    phone: String,
    email: String,
    status: { type: String, default: "new" },
    budget: Number,
    location: String,
    timeline: String,
    intent: String,
    urgency: String,
    readiness_score: Number,
    memory: LeadMemorySchema,
    suggested_properties: [{ type: Schema.Types.ObjectId, ref: "Property" }],
    next_action: String,
    call_insights: {
      summary: String,
      objections: [String],
      action_items: [String],
      next_best_action: String,
    },
    appointments: [
      {
        date: String,
        time: String,
        confirmed: { type: Boolean, default: false },
        channel: String,
        purpose: String,
      },
    ],
    motivation: String,
    channel: String,
  },
  { timestamps: true }
);

export const Lead: Model<ILead> =
  mongoose.models.Lead ?? mongoose.model<ILead>("Lead", LeadSchema);
