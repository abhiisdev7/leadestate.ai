import { Email } from "~/models/email.model.ts";
import type { IEmail } from "~/types/email.types.ts";
import type { EmailStatus, EmailClassification } from "~/types/email.types.ts";

export type CreateEmailInput = Omit<IEmail, "createdAt" | "updatedAt"> &
  Partial<Pick<IEmail, "createdAt" | "updatedAt">>;

export class EmailsRepo {
  async findByMessageId(messageId: string) {
    return Email.findOne({ messageId }).lean().exec();
  }

  async create(data: CreateEmailInput) {
    return Email.create(data);
  }

  async findNewInbound() {
    return Email.find({ direction: "inbound", status: "new" })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  async updateStatus(id: string, status: EmailStatus) {
    await Email.updateOne({ _id: id }, { $set: { status } });
  }

  async updateClassification(id: string, classification: EmailClassification) {
    await Email.updateOne({ _id: id }, { $set: { classification } });
  }

  async updateContactId(id: string, contactId: string) {
    await Email.updateOne({ _id: id }, { $set: { contactId } });
  }

  async getConversation(conversationId: string) {
    return Email.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean()
      .exec();
  }

  async getMaxImapUid(mailbox: string): Promise<number> {
    const result = await Email.findOne({ mailbox })
      .sort({ imapUid: -1 })
      .select("imapUid")
      .lean()
      .exec();
    return result?.imapUid ?? 0;
  }

  async findByContactId(contactId: string) {
    return Email.find({ contactId }).sort({ createdAt: -1 }).lean().exec();
  }

  async findByCampaignId(campaignId: string) {
    return Email.find({ campaignId }).sort({ createdAt: -1 }).lean().exec();
  }

  async list(filters?: { contactId?: string; conversationId?: string; direction?: string }) {
    const query: Record<string, unknown> = {};
    if (filters?.contactId) query.contactId = filters.contactId;
    if (filters?.conversationId) query.conversationId = filters.conversationId;
    if (filters?.direction) query.direction = filters.direction;
    return Email.find(query).sort({ createdAt: -1 }).lean().exec();
  }
}

export const emailsRepo = new EmailsRepo();
