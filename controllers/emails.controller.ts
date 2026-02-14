import type { Request, Response } from "express";
import { emailsRepo } from "~/repos/emails.repo.ts";

export async function list(req: Request, res: Response) {
  const contactId = req.query.contactId as string | undefined;
  const conversationId = req.query.conversationId as string | undefined;
  const direction = req.query.direction as string | undefined;
  const emails = await emailsRepo.list({ contactId, conversationId, direction });
  res.json(emails);
}

export async function getConversation(req: Request, res: Response) {
  const emails = await emailsRepo.getConversation(req.params.conversationId);
  res.json(emails);
}

export async function getByContact(req: Request, res: Response) {
  const emails = await emailsRepo.findByContactId(req.params.contactId);
  res.json(emails);
}

export async function getByCampaign(req: Request, res: Response) {
  const emails = await emailsRepo.findByCampaignId(req.params.campaignId);
  res.json(emails);
}
