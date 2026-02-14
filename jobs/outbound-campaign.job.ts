import { campaignsRepo } from "~/repos/campaigns.repo.ts";
import { contactsRepo } from "~/repos/contacts.repo.ts";
import { emailsRepo } from "~/repos/emails.repo.ts";
import { sendCampaignEmail } from "~/services/email.service.ts";
import { createLogger } from "~/configs/logger.config.ts";
import { Env } from "~/configs/env.config.ts";
import { extractEmail } from "~/utils/email.utils.ts";

const logger = createLogger("outbound-campaign");

export default async function outboundCampaignJob() {
  const pending = await campaignsRepo.findPending();
  if (pending.length === 0) return;

  for (const campaign of pending) {
    const contacts = await contactsRepo.findByIds(campaign.contactIds.map(String));
    const emailMap = new Map(contacts.map((c) => [String(c!._id), c!]));

    let sent = 0;
    let failed = 0;

    for (const contactId of campaign.contactIds) {
      const contact = emailMap.get(String(contactId));
      if (!contact?.email) {
        failed++;
        continue;
      }

      try {
        await sendCampaignEmail({
          to: contact.email,
          subject: campaign.subject,
          bodyText: campaign.bodyText,
          campaignId: campaign.campaignId,
        });

        await emailsRepo.create({
          conversationId: `campaign:${campaign.campaignId}:${contact.email}`,
          messageId: undefined,
          direction: "outbound",
          status: "replied",
          from: Env.SMTP_MAIL,
          to: [contact.email],
          subject: campaign.subject,
          bodyText: campaign.bodyText,
          campaignId: campaign.campaignId,
        });

        sent++;
      } catch (err) {
        logger.warn("Failed to send campaign email", {
          campaignId: campaign.campaignId,
          to: contact.email,
          error: err instanceof Error ? err.message : String(err),
        });
        failed++;
      }
    }

    await campaignsRepo.updateStatus(campaign._id.toString(), "sent", new Date());
    logger.info("Campaign sent", { campaignId: campaign.campaignId, sent, failed });
  }
}
