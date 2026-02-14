import type { Request, Response } from "express";
import { z } from "zod";
import { randomUUID } from "crypto";
import { campaignsRepo } from "~/repos/campaigns.repo.ts";

const createSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  bodyText: z.string().min(1),
  contactIds: z.array(z.string()),
});

export async function list(req: Request, res: Response) {
  const status = req.query.status as string | undefined;
  const campaigns = await campaignsRepo.list(
    status ? { status: status as "draft" | "pending" | "sent" } : undefined
  );
  res.json(campaigns);
}

export async function getById(req: Request, res: Response) {
  const campaign = await campaignsRepo.findById(req.params.id);
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });
  res.json(campaign);
}

export async function create(req: Request, res: Response) {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }
  const { name, subject, bodyText, contactIds } = parsed.data;
  const campaign = await campaignsRepo.create({
    name,
    subject,
    bodyText,
    contactIds,
    status: "draft",
    campaignId: randomUUID(),
  });
  res.status(201).json(campaign);
}

export async function send(req: Request, res: Response) {
  const campaign = await campaignsRepo.findById(req.params.id);
  if (!campaign) return res.status(404).json({ error: "Campaign not found" });
  if (campaign.status !== "draft") {
    return res.status(400).json({ error: "Campaign must be in draft status to send" });
  }
  await campaignsRepo.updateStatus(req.params.id, "pending");
  res.json({ message: "Campaign queued for sending" });
}
