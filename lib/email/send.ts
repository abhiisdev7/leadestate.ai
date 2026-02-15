import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_MAIL_HOST ?? "smtp.gmail.com",
  port: Number(process.env.SMTP_MAIL_PORT) || 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_MAIL_PASSWORD,
  },
});

export interface MeetingEmailParams {
  to: string;
  leadName: string;
  date: string;
  time: string;
  purpose?: string;
}

export async function sendMeetingSchedulerEmail(params: MeetingEmailParams): Promise<void> {
  const { to, leadName, date, time, purpose = "Discovery call" } = params;

  if (!process.env.SMTP_MAIL || !process.env.SMTP_MAIL_PASSWORD) {
    console.warn("SMTP not configured, skipping meeting email");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Call is Scheduled – Leadestate</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="padding: 32px 40px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Your Call is Scheduled</h1>
              <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Leadestate Real Estate</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #334155;">Hi ${leadName},</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                Your call has been confirmed. Here are the details:
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0 0 8px; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Date & Time</p>
                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #0f172a;">${date} at ${time}</p>
                    <p style="margin: 12px 0 0; font-size: 12px; font-weight: 600; color: #64748b; text-transform: uppercase;">Purpose</p>
                    <p style="margin: 4px 0 0; font-size: 14px; color: #334155;">${purpose}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                We'll call you at the scheduled time. If you need to reschedule, reply to this email or give us a call.
              </p>
              <p style="margin: 24px 0 0; font-size: 14px; line-height: 1.6; color: #334155;">
                Best regards,<br>
                <strong>The Leadestate Team</strong>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  await transporter.sendMail({
    from: `"Leadestate" <${process.env.SMTP_MAIL}>`,
    to,
    subject: `Your call is scheduled – ${date} at ${time}`,
    html,
  });
}
