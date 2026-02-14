import { ImapFlow, type ImapFlowOptions } from 'imapflow'
import { Env } from "~/configs/env.config.ts";

export const imapConfig: ImapFlowOptions = {
  auth: { user: Env.IMAP_MAIL, pass: Env.IMAP_MAIL_PASSWORD },
  host: Env.IMAP_MAIL_HOST,
  port: Env.IMAP_EMAIL_PORT,
  secure: true,
} 