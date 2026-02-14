import { Email } from "~models/email.model";
import type { IEmail } from "~types/email.types";

export type CreateEmailInput = Omit<IEmail, "createdAt" | "updatedAt"> &
  Partial<Pick<IEmail, "createdAt" | "updatedAt">>;

export class EmailsRepo {
  async findByMessageId(messageId: string) {
    return Email.findOne({ messageId }).lean().exec();
  }

  async create(data: CreateEmailInput) {
    return Email.create(data);
  }

  /** Returns the highest imapUid for the mailbox, or 0 if none. Used for incremental sync. */
  async getMaxImapUid(mailbox: string): Promise<number> {
    const result = await Email.findOne({ mailbox })
      .sort({ imapUid: -1 })
      .select("imapUid")
      .lean()
      .exec();
    return result?.imapUid ?? 0;
  }
}

export const emailsRepo = new EmailsRepo();
