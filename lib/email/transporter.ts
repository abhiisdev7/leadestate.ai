import nodemailer from "nodemailer";

/**
 * Creates a nodemailer transporter with serverless-friendly options.
 * Call at send time (lazy) so process.env is read at runtime, not build time.
 * Options tuned for Vercel/serverless: no connection pooling, explicit timeouts.
 */
export function getTransporter() {
  const host = process.env.SMTP_MAIL_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_MAIL_PORT) || 587;
  const isSecure = port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    requireTLS: !isSecure,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_MAIL_PASSWORD,
    },
    // Serverless-friendly: no connection pooling, explicit timeouts
    pool: false,
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  } as nodemailer.TransportOptions);
}
