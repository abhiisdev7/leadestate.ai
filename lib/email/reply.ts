import { getTransporter } from "./transporter";

export interface CancellationReplyParams {
  to: string;
  leadName: string;
  date: string;
  time: string;
  inReplyTo: string;
  references: string[];
  subject: string;
}

export async function sendCancellationReply(
  params: CancellationReplyParams
): Promise<void> {
  const { to, leadName, date, time, inReplyTo, references, subject } = params;

  if (!process.env.SMTP_MAIL || !process.env.SMTP_MAIL_PASSWORD) {
    console.warn("SMTP not configured, skipping cancellation reply");
    return;
  }

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meeting Cancelled – Leadestate</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f5f5f5; padding: 24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); overflow: hidden;">
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 16px; font-size: 16px; line-height: 1.6; color: #334155;">Hi ${leadName},</p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                We've received your request and cancelled your call scheduled for ${date} at ${time}.
              </p>
              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #334155;">
                If you'd like to reschedule at a different time, simply reply to this email or give us a call. We're here to help whenever you're ready.
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

  await getTransporter().sendMail({
    from: `"Leadestate" <${process.env.SMTP_MAIL}>`,
    to,
    subject: subject.startsWith("Re:") ? subject : `Re: ${subject}`,
    html,
    ...(inReplyTo && { inReplyTo }),
    ...(references.length > 0 && { references: references.join(" ") }),
  });
}
