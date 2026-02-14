import type { Request, Response } from "express";
import { contactsRepo } from "~/repos/contacts.repo.ts";

export async function list(req: Request, res: Response) {
  const status = req.query.status as string | undefined;
  const intent = req.query.intent as string | undefined;
  const contacts = await contactsRepo.list({ status, intent });
  res.json(contacts);
}

export async function getById(req: Request, res: Response) {
  const contact = await contactsRepo.findById(req.params.id);
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  res.json(contact);
}

export async function create(req: Request, res: Response) {
  const { name, email, phone, intent, source } = req.body;
  if (!name || !email || !intent) {
    return res.status(400).json({ error: "name, email, intent are required" });
  }
  const contact = await contactsRepo.create({
    name,
    email,
    intent,
    status: "new",
    ...(phone && { phone }),
    ...(source && { source }),
  });
  res.status(201).json(contact);
}

export async function update(req: Request, res: Response) {
  const contact = await contactsRepo.update(req.params.id, req.body);
  if (!contact) return res.status(404).json({ error: "Contact not found" });
  res.json(contact);
}
