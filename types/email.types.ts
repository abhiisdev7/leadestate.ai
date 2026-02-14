export type EmailDirection = "inbound" | "outbound";

export type EmailStatus =
  | "new"       // just received, not yet processed
  | "replied"   // we sent a reply
  | "failed";   // processing/send failed

export interface IAttachment {
  filename: string;
  mimeType: string;
  size: number;
}

export interface IEmail {
  /* Threading */
  conversationId: string;
  messageId?: string;
  inReplyTo?: string;
  parentEmailId?: string;

  /* IMAP */
  imapUid?: number;
  mailbox?: string;
  flags?: string[];

  /* Flow */
  direction: EmailDirection;
  status: EmailStatus;

  /* Participants */
  from: string;
  to: string[];

  /* Content */
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  attachments?: IAttachment[];

  /* Timestamps */
  createdAt: Date;
  updatedAt: Date;
}
