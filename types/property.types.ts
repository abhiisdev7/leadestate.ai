export type PropertySource = "listing" | "seller_inquiry";

export type PropertyStatus = "inquiry" | "qualified" | "listed" | "sold" | "off_market";

export interface IProperty {
  _id: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  price?: number;
  priceExpectation?: number;
  condition?: string;
  timeline?: string;
  source: PropertySource;
  status: PropertyStatus;
  contactId?: string;
  createdAt: Date;
  updatedAt: Date;
}
