export type CampaignStatus = "draft" | "pending" | "sent";

export interface ICampaign {
  _id: string;
  name: string;
  subject: string;
  bodyText: string;
  contactIds: string[];
  status: CampaignStatus;
  campaignId: string;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
