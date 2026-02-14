import mongoose from "mongoose";
import type { ICampaign } from "~/types/campaign.types.ts";

const CampaignSchema = new mongoose.Schema<ICampaign>(
  {
    name: { type: String, required: true },
    subject: { type: String, required: true },
    bodyText: { type: String, required: true },
    contactIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "contacts" }],
    status: {
      type: String,
      enum: ["draft", "pending", "sent"],
      default: "draft",
      index: true,
    },
    campaignId: { type: String, required: true, unique: true },
    sentAt: { type: Date },
  },
  { timestamps: true, collection: "campaigns" }
);


export const Campaign = mongoose.model<ICampaign>("campaigns", CampaignSchema);
