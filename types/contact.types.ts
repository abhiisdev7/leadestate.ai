export type ContactIntent = "buyer" | "seller" | "both";

export type ContactUrgency = "low" | "medium" | "high";

export type ContactStatus =
  | "new"        // just came in, not yet contacted
  | "contacted"  // initial outreach done
  | "qualified"  // qualified lead
  | "viewing"    // property viewings scheduled
  | "offer"      // offer in progress
  | "closed"     // deal closed
  | "lost";      // lead lost / disqualified

export interface IContact {
  /* Identity */
  name: string;
  email: string;
  phone?: string;

  /* Lead qualification (from Track 2 rules) */
  intent: ContactIntent;
  urgency?: ContactUrgency;
  budgetMin?: number;   // for buyers
  budgetMax?: number;   // for buyers
  priceRange?: string;  // for sellers
  location?: string;    // city, state, zip
  timeline?: string;    // when looking to buy/sell
  motivation?: string;  // why moving
  readinessScore?: number;  // 0–100

  /* CRM workflow */
  status: ContactStatus;
  source?: string;      // email, website, referral, etc.
  notes?: string;
  nextBestAction?: string;

  /* Optional */
  tags?: string[];
  assignedTo?: string;  // agent/user ID for handoff

  /* Timestamps */
  createdAt: Date;
  updatedAt: Date;
}
