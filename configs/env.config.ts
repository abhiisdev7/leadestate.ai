import { z } from "zod";

const EnvSchema = z.object({
  // === IMAP EMAIL SERVICE CONFIGURATION ===
  IMAP_MAIL: z.email(),
  IMAP_MAIL_PASSWORD: z.string().min(1, "IMAP_MAIL_PASSWORD is required"),
  IMAP_MAIL_HOST: z.string().min(1, "IMAP_MAIL_HOST is required"),
  IMAP_EMAIL_PORT: z.coerce.number().default(993),

  // === SMTP EMAIL SERVICE CONFIGURATION ===
  SMTP_MAIL: z.email(),
  SMTP_MAIL_PASSWORD: z.string().min(1, "SMTP_MAIL_PASSWORD is required"),
  SMTP_MAIL_HOST: z.string().min(1, "SMTP_MAIL_HOST is required"),
  SMTP_MAIL_PORT: z.coerce.number().default(587),

  // === OPENAI CONFIGURATION ===
  OPENAI_API_KEY: z.string().min(1, "OPENAI_API_KEY is required"),

  // === DATABASE CONFIGURATION ===
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DATABASE_NAME: z.string().min(1, "DATABASE_NAME is required"),

  PORT: z.coerce.number().default(3000),
});

export const Env = EnvSchema.parse(process.env);
export type EnvConfig = z.infer<typeof EnvSchema>;