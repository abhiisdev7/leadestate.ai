import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { emailsRepo } from "~/repos/emails.repo.ts";
import { contactsRepo } from "~/repos/contacts.repo.ts";
import { propertiesRepo } from "~/repos/properties.repo.ts";
import { imapConfig } from "~/configs/imap.config.ts";
import { Env } from "~/configs/env.config.ts";
import { createLogger } from "~/configs/logger.config.ts";
import {
  classifyInboundEmail,
  extractPropertyDetailsFromMessage,
  generateLeadResponse,
  generateSellerLeadResponse,
} from "~/services/ai.service.ts";
import { sendReply } from "~/services/email.service.ts";
import { extractEmail, parseNameAndEmail } from "~/utils/email.utils.ts";
import type { EmailClassification } from "~/types/email.types.ts";

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

function getCampaignIdFromHeaders(parsed: { headers?: { get: (k: string) => string | undefined } }): string | undefined {
  return parsed?.headers?.get("x-campaign");
}

async function processNewInboundLeads() {
  const newInbound = await emailsRepo.findNewInbound();
  let replied = 0;
  let failed = 0;

  for (const email of newInbound) {
    const id = String(email._id);
    try {
      const classification = await classifyInboundEmail({
        from: email.from,
        subject: email.subject,
        bodyText: email.bodyText,
      });

      await emailsRepo.updateClassification(id, classification);

      if (classification === "spam") {
        await emailsRepo.updateStatus(id, "replied");
        replied++;
        continue;
      }

      const { name, email: contactEmail } = parseNameAndEmail(email.from);
      const intent = classification === "seller_lead" ? "seller" : classification === "buyer_lead" ? "buyer" : "both";
      const contact = await contactsRepo.upsertByEmail({
        email: contactEmail,
        name,
        intent,
        source: "email",
      });
      await emailsRepo.updateContactId(id, String(contact._id));

      const conversation = await emailsRepo.getConversation(email.conversationId);
      const exchangeCount = Math.floor(
        conversation.filter((e) => e.direction === "inbound" || e.status === "replied").length / 2
      );

      const history = conversation
        .filter((e) => e.bodyText)
        .map((e) => ({
          role: (e.direction === "inbound" ? "user" : "assistant") as "user" | "assistant",
          content: e.bodyText!,
        }));

      let replyText: string;

      if (classification === "seller_lead") {
        const extracted = await extractPropertyDetailsFromMessage({ bodyText: email.bodyText });
        if (Object.keys(extracted).length > 0) {
          await propertiesRepo.upsertForContact(String(contact._id), extracted);
        }
        const existingProperty = await propertiesRepo.findByContactId(String(contact._id)).then((p) => p[0]);
        replyText = await generateSellerLeadResponse({
          from: email.from,
          subject: email.subject,
          bodyText: email.bodyText,
          conversationHistory: history,
          existingProperty,
          exchangeCount,
        });
      } else {
        const suggestedProps = await propertiesRepo.findByCriteria({}).then((p) => p.slice(0, 5));
        replyText = await generateLeadResponse({
          from: email.from,
          subject: email.subject,
          bodyText: email.bodyText,
          conversationHistory: history,
          classification,
          suggestedProperties: suggestedProps.map((p) => ({
            address: p.address ?? p.city,
            price: p.price ?? p.priceExpectation,
            beds: p.beds,
            baths: p.baths,
          })),
          exchangeCount,
        });
      }

      await sendReply({
        to: contactEmail,
        subject: email.subject ?? "Your inquiry",
        bodyText: replyText,
        inReplyTo: email.messageId,
        references: email.messageId,
      });

      await emailsRepo.updateStatus(id, "replied");
      replied++;
      logger.info("Sent AI reply to lead", { messageId: email.messageId, to: contactEmail, classification });
    } catch (err) {
      logger.warn("Failed to reply to lead", {
        messageId: email.messageId,
        error: err instanceof Error ? err.message : String(err),
      });
      await emailsRepo.updateStatus(id, "failed");
      failed++;
    }
  }

  if (replied > 0 || failed > 0) {
    logger.info("Processed new inbound leads", { replied, failed });
  }
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
          const campaignId = parsed ? getCampaignIdFromHeaders(parsed) : undefined;

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
            ...(campaignId && { campaignId }),
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

  await processNewInboundLeads();
}
