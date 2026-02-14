import { Campaign } from "~/models/campaign.model.ts";
import type { ICampaign } from "~/types/campaign.types.ts";
import type { CampaignStatus } from "~/types/campaign.types.ts";

export type CreateCampaignInput = Omit<ICampaign, "_id" | "createdAt" | "updatedAt"> &
  Partial<Pick<ICampaign, "createdAt" | "updatedAt">>;

export class CampaignsRepo {
  async create(data: CreateCampaignInput) {
    return Campaign.create(data);
  }

  async findById(id: string) {
    return Campaign.findById(id).populate("contactIds").lean().exec();
  }

  async findPending() {
    return Campaign.find({ status: "pending" }).lean().exec();
  }

  async updateStatus(id: string, status: CampaignStatus, sentAt?: Date) {
    const update: Record<string, unknown> = { status };
    if (sentAt) update.sentAt = sentAt;
    return Campaign.findByIdAndUpdate(id, { $set: update }, { new: true }).lean().exec();
  }

  async list(filters?: { status?: CampaignStatus }) {
    const query: Record<string, unknown> = {};
    if (filters?.status) query.status = filters.status;
    return Campaign.find(query).sort({ createdAt: -1 }).lean().exec();
  }
}

export const campaignsRepo = new CampaignsRepo();
