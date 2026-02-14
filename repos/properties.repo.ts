import { Property } from "~/models/property.model.ts";
import type { IProperty } from "~/types/property.types.ts";

export type CreatePropertyInput = Omit<IProperty, "_id" | "createdAt" | "updatedAt"> &
  Partial<Pick<IProperty, "createdAt" | "updatedAt">>;

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export class PropertiesRepo {
  async create(data: CreatePropertyInput) {
    return Property.create(data);
  }

  async findById(id: string) {
    return Property.findById(id).lean().exec();
  }

  async findByContactId(contactId: string) {
    return Property.find({ contactId }).sort({ createdAt: -1 }).lean().exec();
  }

  async update(id: string, data: UpdatePropertyInput) {
    return Property.findByIdAndUpdate(id, { $set: data }, { new: true }).lean().exec();
  }

  async upsertForContact(contactId: string, data: Partial<CreatePropertyInput>) {
    const existing = await Property.findOne({ contactId, source: "seller_inquiry" }).exec();
    const payload = { ...data, contactId, source: "seller_inquiry" as const };
    if (existing) {
      await Property.updateOne({ _id: existing._id }, { $set: payload });
      return (await Property.findById(existing._id).lean().exec())!;
    }
    const created = await Property.create(payload);
    return created.toObject();
  }

  async findByCriteria(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    source?: string;
  }) {
    const query: Record<string, unknown> = { source: "listing" };
    if (filters.location) {
      query.$or = [
        { address: new RegExp(filters.location, "i") },
        { city: new RegExp(filters.location, "i") },
        { state: new RegExp(filters.location, "i") },
      ];
    }
    if (filters.minPrice != null || filters.maxPrice != null) {
      query.price = {};
      if (filters.minPrice != null) (query.price as Record<string, number>).$gte = filters.minPrice;
      if (filters.maxPrice != null) (query.price as Record<string, number>).$lte = filters.maxPrice;
    }
    if (filters.source) query.source = filters.source;
    return Property.find(query).sort({ createdAt: -1 }).lean().exec();
  }

  async list(filters?: { source?: string; status?: string }) {
    const query: Record<string, unknown> = {};
    if (filters?.source) query.source = filters.source;
    if (filters?.status) query.status = filters.status;
    return Property.find(query).sort({ createdAt: -1 }).lean().exec();
  }
}

export const propertiesRepo = new PropertiesRepo();
