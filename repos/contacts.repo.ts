import { Contact } from "~/models/contact.model.ts";
import type { IContact } from "~/types/contact.types.ts";
import type { ContactIntent } from "~/types/contact.types.ts";

export type CreateContactInput = Omit<IContact, "createdAt" | "updatedAt"> &
  Partial<Pick<IContact, "createdAt" | "updatedAt">>;

export type UpdateContactInput = Partial<Omit<CreateContactInput, "email">>;

export class ContactsRepo {
  async findById(id: string) {
    return Contact.findById(id).lean().exec();
  }

  async findByIds(ids: string[]) {
    return Contact.find({ _id: { $in: ids } }).lean().exec();
  }

  async findByEmail(email: string) {
    return Contact.findOne({ email: email.toLowerCase() }).lean().exec();
  }

  async create(data: CreateContactInput) {
    return Contact.create({ ...data, email: data.email.toLowerCase() });
  }

  async update(id: string, data: UpdateContactInput) {
    return Contact.findByIdAndUpdate(id, { $set: data }, { new: true }).lean().exec();
  }

  async upsertByEmail(data: {
    email: string;
    name: string;
    intent: ContactIntent;
    phone?: string;
    source?: string;
    location?: string;
    timeline?: string;
  }) {
    const email = data.email.toLowerCase();
    const existing = await Contact.findOne({ email }).exec();
    if (existing) {
      await Contact.updateOne(
        { email },
        {
          $set: {
            name: data.name || existing.name,
            intent: data.intent,
            ...(data.phone && { phone: data.phone }),
            ...(data.source && { source: data.source }),
            ...(data.location && { location: data.location }),
            ...(data.timeline && { timeline: data.timeline }),
          },
        }
      );
      return (await Contact.findById(existing._id).lean().exec())!;
    }
    const created = await Contact.create({
      email,
      name: data.name,
      intent: data.intent,
      status: "new",
      ...(data.phone && { phone: data.phone }),
      ...(data.source && { source: data.source }),
      ...(data.location && { location: data.location }),
      ...(data.timeline && { timeline: data.timeline }),
    });
    return created.toObject();
  }

  async list(filters?: { status?: string; intent?: string }) {
    const query: Record<string, unknown> = {};
    if (filters?.status) query.status = filters.status;
    if (filters?.intent) query.intent = filters.intent;
    return Contact.find(query).sort({ createdAt: -1 }).lean().exec();
  }
}

export const contactsRepo = new ContactsRepo();
