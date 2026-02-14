/** API entity types — align with backend models */

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  intent: "buyer" | "seller" | "both";
  status: string;
  urgency?: string;
  location?: string;
  budgetMin?: number;
  budgetMax?: number;
  notes?: string;
  nextBestAction?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Campaign {
  _id: string;
  name: string;
  subject: string;
  bodyText: string;
  contactIds?: string[];
  status: "draft" | "pending" | "sent";
  sentAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Email {
  _id: string;
  conversationId: string;
  contactId?: string;
  direction: "inbound" | "outbound";
  subject?: string;
  bodyText?: string;
  classification?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Property {
  _id: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  price?: number;
  status: string;
  source?: string;
  createdAt?: string;
  updatedAt?: string;
}
