import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { emailsRepo } from "~/repos/emails.repo.ts";
import { imapConfig } from "~configs/imap.config";
import { Env } from "~configs/env.config";
import { createLogger } from "~configs/logger.config";

const logger = createLogger("inbound-check");

function formatAddress(addr: { address?: string; name?: string } | undefined): string {
  if (!addr) return "";

  const email = addr.address ?? "";
  const name = addr.name?.trim();

  return name ? `${name} <${email}>` : email;
}

function formatAddressList(addrs: Array<{ address?: string; name?: string }> | undefined): string[] {
  if (!addrs?.length) return [];
  return addrs.map((a) => formatAddress(a)).filter(Boolean);
}

export default async function inBoundCheckJob() {
  const client = new ImapFlow(imapConfig);
  const ourEmail = Env.IMAP_MAIL.toLowerCase();

  try {
    await client.connect();
    logger.info("Connected to IMAP");

    const lock = await client.getMailboxLock("INBOX");

    try {
      const lastUid = await emailsRepo.getMaxImapUid("INBOX");
      const uidRange = `${lastUid + 1}:*`;
      logger.debug("Incremental sync", { lastUid, uidRange });
      let inserted = 0;
      let skipped = 0;

      for await (const msg of client.fetch(
        uidRange,
        {
          uid: true,
          flags: true,
          envelope: true,
          source: true,
        },
        { uid: true }
      )) {
        try {
          const messageId = msg.envelope?.messageId ?? `uid:${msg.uid}`;
          const existing = await emailsRepo.findByMessageId(messageId);
          if (existing) {
            skipped++;
            continue;
          }

          const raw = msg.source;
          const parsed = raw ? await simpleParser(raw) : null;

          const fromAddr = msg.envelope?.from?.[0];
          const fromStr = formatAddress(fromAddr);
          const toAddrs = formatAddressList(msg.envelope?.to);
          const isOutbound = fromAddr?.address?.toLowerCase() === ourEmail;

          const conversationId = msg.envelope?.inReplyTo ?? messageId;

          await emailsRepo.create({
            conversationId,
            messageId,
            inReplyTo: msg.envelope?.inReplyTo ?? undefined,
            imapUid: msg.uid,
            mailbox: "INBOX",
            flags: msg.flags ? Array.from(msg.flags) : [],
            direction: isOutbound ? "outbound" : "inbound",
            status: "new",
            from: fromStr,
            to: toAddrs,
            subject: msg.envelope?.subject ?? parsed?.subject ?? undefined,
            bodyText: parsed?.text ?? undefined,
            bodyHtml: typeof parsed?.html === "string" ? parsed.html : undefined,
          });

          inserted++;
          logger.debug("Inserted email", { messageId, subject: msg.envelope?.subject });
        } catch (err) {
          logger.warn("Failed to process email", {
            uid: msg.uid,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }

      logger.info("Inbound check complete", { inserted, skipped });
    } finally {
      lock.release();
    }

    await client.logout();
  } catch (err) {
    logger.error("Inbound check failed", {
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  } finally {
    client.close();
  }
}
