import mongoose from "mongoose";
import type { IEmail } from "~types/email.types";

const EmailSchema = new mongoose.Schema<IEmail>(
  {
    conversationId: { type: String, required: true, index: true },
    messageId: { type: String },
    inReplyTo: { type: String },
    parentEmailId: { type: mongoose.Schema.Types.ObjectId, ref: "emails" },

    imapUid: { type: Number },
    mailbox: { type: String, default: "INBOX" },
    flags: [{ type: String }],

    direction: {
      type: String,
      enum: ["inbound", "outbound"],
      required: true,
    },
    status: {
      type: String,
      enum: ["new", "replied", "failed"],
      default: "new",
      index: true,
    },
    classification: {
      type: String,
      enum: ["buyer_lead", "seller_lead", "general_inquiry", "spam", "unknown"],
      index: true,
    },
    contactId: { type: mongoose.Schema.Types.ObjectId, ref: "contacts", index: true },
    campaignId: { type: String, index: true },

    from: { type: String, required: true },
    to: [{ type: String }],

    subject: { type: String },
    bodyText: { type: String },
    bodyHtml: { type: String },
  },
  { timestamps: true, collection: "emails" }
);

EmailSchema.index({ messageId: 1 }, { unique: true, sparse: true });
EmailSchema.index({ conversationId: 1, createdAt: 1 });

export const Email = mongoose.model<IEmail>("emails", EmailSchema);
