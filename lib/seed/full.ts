import { Lead, Property } from "@/lib/db";
import { SEED_PROPERTIES } from "@/lib/data/properties";

export async function runFullSeed() {
  await Lead.deleteMany({});
  await Property.deleteMany({});

  const properties = await Property.insertMany(SEED_PROPERTIES);
  const propIds = properties.map((p) => p._id);

  const leads = [
    {
      name: "Sarah Chen",
      phone: "(512) 555-0142",
      email: "sarah.chen@email.com",
      status: "qualified",
      intent: "buy",
      urgency: "high",
      budget: 485000,
      location: "Austin, TX",
      timeline: "2–3 months",
      motivation: "Relocating for job, needs to move before school year",
      readiness_score: 8,
      channel: "inbound" as const,
      next_action: "Schedule property tour for 3 listings",
      suggested_properties: [propIds[0], propIds[4], propIds[9]],
      call_insights: {
        summary: "First-time buyer, pre-approved for $500k. Wants 3+ beds, backyard, good schools.",
        objections: ["Concerned about HOA fees"],
        action_items: ["Send comps for Oak Street area", "Schedule tour"],
        next_best_action: "Propose tour slots for next week",
      },
      appointments: [
        { date: "2025-02-18", time: "2:00 PM", confirmed: true, channel: "inbound" as const, purpose: "Property tour" },
      ],
    },
    {
      name: "Marcus Johnson",
      phone: "(512) 555-0189",
      email: "m.johnson@email.com",
      status: "qualified",
      intent: "sell",
      urgency: "medium",
      location: "Round Rock, TX",
      timeline: "4–6 months",
      motivation: "Upsizing for growing family",
      readiness_score: 6,
      channel: "inbound" as const,
      next_action: "Send CMA and staging recommendations",
      suggested_properties: [propIds[10], propIds[11]],
      call_insights: {
        summary: "Selling 3/2 in Round Rock. Wants to upsize. Needs CMA.",
        objections: [],
        action_items: ["Prepare CMA", "Share staging tips"],
        next_best_action: "Schedule listing appointment",
      },
      appointments: [
        { date: "2025-02-17", time: "4:00 PM", confirmed: true, channel: "inbound" as const, purpose: "Listing appointment" },
      ],
    },
    {
      name: "Emily Rodriguez",
      phone: "(512) 555-0221",
      email: "emily.r@email.com",
      status: "qualified",
      intent: "buy",
      urgency: "low",
      budget: 420000,
      location: "Austin, TX",
      timeline: "6+ months",
      motivation: "Exploring options, not in a rush",
      readiness_score: 4,
      channel: "outbound" as const,
      next_action: "Follow up with property alerts",
      suggested_properties: [propIds[4], propIds[7], propIds[2]],
      call_insights: {
        summary: "Early-stage buyer. Budget $400–450k. Interested in East Austin.",
        objections: ["Wants to wait for rates to drop"],
        action_items: ["Set up saved search", "Send monthly market update"],
        next_best_action: "Add to nurture sequence, follow up in 2 weeks",
      },
      appointments: [],
    },
    {
      name: "David Park",
      phone: "(512) 555-0333",
      email: "david.park@email.com",
      status: "qualified",
      intent: "sell",
      urgency: "high",
      location: "Cedar Park, TX",
      timeline: "1–2 months",
      motivation: "Job transfer, must sell quickly",
      readiness_score: 7,
      channel: "outbound" as const,
      next_action: "Schedule listing consultation",
      suggested_properties: [propIds[12], propIds[13]],
      call_insights: {
        summary: "Outbound cold call. Motivated seller, needs quick sale.",
        objections: [],
        action_items: ["Send market analysis", "Propose listing strategy"],
        next_best_action: "Call back to schedule listing appointment",
      },
      appointments: [
        { date: "2025-02-19", time: "10:00 AM", confirmed: false, channel: "outbound" as const, purpose: "Listing consultation" },
      ],
    },
  ];

  await Lead.insertMany(leads as Parameters<typeof Lead.insertMany>[0]);

  return { propertiesCount: properties.length, leadsCount: 4 };
}
