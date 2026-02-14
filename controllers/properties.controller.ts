import type { Request, Response } from "express";
import { propertiesRepo } from "~/repos/properties.repo.ts";

export async function list(req: Request, res: Response) {
  const source = req.query.source as string | undefined;
  const status = req.query.status as string | undefined;
  const location = req.query.location as string | undefined;
  const minPrice = req.query.minPrice != null ? Number(req.query.minPrice) : undefined;
  const maxPrice = req.query.maxPrice != null ? Number(req.query.maxPrice) : undefined;

  if (location || minPrice != null || maxPrice != null) {
    const properties = await propertiesRepo.findByCriteria({
      location,
      minPrice,
      maxPrice,
    });
    return res.json(properties);
  }

  const properties = await propertiesRepo.list({ source, status });
  res.json(properties);
}

export async function getById(req: Request, res: Response) {
  const property = await propertiesRepo.findById(req.params.id);
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
}

export async function getByContact(req: Request, res: Response) {
  const properties = await propertiesRepo.findByContactId(req.params.contactId);
  res.json(properties);
}

export async function create(req: Request, res: Response) {
  const { address, city, state, zip, beds, baths, sqft, price, source, contactId } = req.body;
  if (!source) {
    return res.status(400).json({ error: "source is required (listing or seller_inquiry)" });
  }
  const property = await propertiesRepo.create({
    address,
    city,
    state,
    zip,
    beds,
    baths,
    sqft,
    price,
    source,
    status: "inquiry",
    ...(contactId && { contactId }),
  });
  res.status(201).json(property);
}

export async function update(req: Request, res: Response) {
  const property = await propertiesRepo.update(req.params.id, req.body);
  if (!property) return res.status(404).json({ error: "Property not found" });
  res.json(property);
}
