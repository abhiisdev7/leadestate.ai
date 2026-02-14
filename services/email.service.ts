import nodemailer from "nodemailer";
import { Env } from "~/configs/env.config.ts";

const transporter = nodemailer.createTransport({
  host: Env.SMTP_MAIL_HOST,
  port: Env.SMTP_MAIL_PORT,
  secure: Env.SMTP_MAIL_PORT === 465,
  auth: {
    user: Env.SMTP_MAIL,
    pass: Env.SMTP_MAIL_PASSWORD,
  },
});

export interface SendReplyInput {
  to: string;
  subject: string;
  bodyText: string;
  inReplyTo?: string;
  references?: string;
}

export async function sendReply(input: SendReplyInput): Promise<void> {
  await transporter.sendMail({
    from: Env.SMTP_MAIL,
    to: input.to,
    subject: input.subject.startsWith("Re:") ? input.subject : `Re: ${input.subject}`,
    text: input.bodyText,
    inReplyTo: input.inReplyTo,
    references: input.references,
  });
}

export interface SendCampaignEmailInput {
  to: string;
  subject: string;
  bodyText: string;
  campaignId: string;
}

export async function sendCampaignEmail(input: SendCampaignEmailInput): Promise<void> {
  await transporter.sendMail({
    from: Env.SMTP_MAIL,
    to: input.to,
    subject: input.subject,
    text: input.bodyText,
    headers: {
      "X-Campaign": input.campaignId,
    },
  });
}
