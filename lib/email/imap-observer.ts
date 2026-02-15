import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { connectDB, Schedule } from "@/lib/db";
import { classifyEmailIntent } from "@/lib/ai/classify-email-intent";
import { handleCancelMeeting } from "./cancel-meeting-handler";

// MongoDB ObjectId is 24 hex chars
const SCHEDULE_MESSAGE_ID_REGEX = /schedule-([a-f0-9]{24})@leadestate\.local/i;

function extractScheduleIdFromHeaders(
  inReplyTo: string | undefined,
  references: string | undefined
): string | null {
  const combined = [inReplyTo, references].filter(Boolean).join(" ");
  const match = combined.match(SCHEDULE_MESSAGE_ID_REGEX);
  return match ? match[1] : null;
}

function extractOurMessageId(
  inReplyTo: string | undefined,
  references: string | undefined
): string | null {
  const combined = [inReplyTo, references].filter(Boolean).join(" ");
  const match = combined.match(/<schedule-[a-f0-9]+@leadestate\.local>/i);
  return match ? match[0] : null;
}

export async function runEmailObserver(): Promise<{ processed: number; cancelled: number }> {
  const host = process.env.IMAP_MAIL_HOST ?? "imap.gmail.com";
  const port = Number(process.env.IMAP_EMAIL_PORT) || 993;
  // Gmail uses same credentials for IMAP and SMTP
  const user = process.env.IMAP_MAIL ?? process.env.SMTP_MAIL;
  const pass = process.env.IMAP_MAIL_PASSWORD ?? process.env.SMTP_MAIL_PASSWORD;

  if (!user || !pass) {
    console.warn("IMAP not configured: set IMAP_MAIL/IMAP_MAIL_PASSWORD or SMTP_MAIL/SMTP_MAIL_PASSWORD");
    return { processed: 0, cancelled: 0 };
  }

  const client = new ImapFlow({
    host,
    port,
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  let processed = 0;
  let cancelled = 0;

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    try {
      const searchResult = await client.search({ seen: false }, { uid: true });
      const uidList = searchResult === false ? [] : searchResult;

      for (const uid of uidList) {
        try {
          const msg = await client.fetchOne(
            String(uid),
            { uid: true, envelope: true, source: true },
            { uid: true }
          );

          if (msg === false || !msg.source) continue;

          const parsed = await simpleParser(msg.source);
          const inReplyTo =
            parsed.inReplyTo ??
            (parsed.headers.get("in-reply-to") as string | undefined);
          const references =
            (parsed.references as string | string[] | undefined) != null
              ? Array.isArray(parsed.references)
                ? parsed.references.join(" ")
                : String(parsed.references)
              : (parsed.headers.get("references") as string | undefined);

          const scheduleId = extractScheduleIdFromHeaders(inReplyTo, references);
          if (!scheduleId) continue;

          const ourMessageId = extractOurMessageId(inReplyTo, references);
          if (!ourMessageId) continue;

          const body = String(parsed.text ?? parsed.html ?? "");
          const subject = String(
            parsed.subject ?? msg.envelope?.subject ?? ""
          );

          const intent = await classifyEmailIntent(subject, body);
          processed++;

          if (intent === "cancel") {
            await connectDB();
            const schedule = await Schedule.findById(scheduleId)
              .populate("lead")
              .populate("contact")
              .lean();

            if (schedule?.status === "cancelled") {
              await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
              continue;
            }

            const lead = schedule?.lead as { name?: string; email?: string } | null;
            const contact = schedule?.contact as { email?: string } | null;
            const to =
              parsed.from?.value?.[0]?.address ?? lead?.email ?? contact?.email;
            if (!to) {
              console.warn(`No recipient for schedule ${scheduleId}, skipping reply`);
            } else {
              await handleCancelMeeting({
                scheduleId,
                to,
                leadName: lead?.name ?? "there",
                date: schedule?.date ?? "",
                time: schedule?.time ?? "",
                ourMessageId,
                customerMessageId: parsed.messageId ?? "",
                subject,
              });
              cancelled++;
            }
          }

          await client.messageFlagsAdd(String(uid), ["\\Seen"], { uid: true });
        } catch (err) {
          console.error(`Error processing email UID ${uid}:`, err);
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    console.error("IMAP observer error:", err);
    throw err;
  }

  return { processed, cancelled };
}
