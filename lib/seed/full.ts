import { faker } from "@faker-js/faker";
import { Contact, Lead, Property, Schedule } from "@/lib/db";
import { SEED_PROPERTIES } from "@/lib/data/properties";

function dateStr(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function generateContacts(count: number): Array<{ name: string; phone: string; email: string; source: "inbound" | "outbound" }> {
  const contacts: Array<{ name: string; phone: string; email: string; source: "inbound" | "outbound" }> = [];
  const usedEmails = new Set<string>();
  while (contacts.length < count) {
    const name = faker.person.fullName();
    const email = faker.internet.email().toLowerCase();
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);
    contacts.push({
      name,
      phone: faker.phone.number({ style: "international" }),
      email,
      source: faker.helpers.arrayElement(["inbound", "outbound"] as const),
    });
  }
  return contacts;
}

export async function runFullSeed() {
  await Schedule.deleteMany({});
  await Lead.deleteMany({});
  await Contact.deleteMany({});
  await Property.deleteMany({});

  const properties = await Property.insertMany(SEED_PROPERTIES);
  const propIds = properties.map((p) => p._id);

  const leadContacts = [
    { name: "Sarah Chen", phone: "(512) 555-0142", email: "sarah.chen@email.com", source: "inbound" as const },
    { name: "Marcus Johnson", phone: "(512) 555-0189", email: "m.johnson@email.com", source: "inbound" as const },
    { name: "Emily Rodriguez", phone: "(512) 555-0221", email: "emily.r@email.com", source: "outbound" as const },
    { name: "David Park", phone: "(512) 555-0333", email: "david.park@email.com", source: "outbound" as const },
  ];
  const fakerContacts = generateContacts(46);
  const contactData = [...leadContacts, ...fakerContacts];
  const contacts = await Contact.insertMany(contactData);
  const contactIds = contacts.map((c) => c._id);

  const leads = [
    {
      contact: contactIds[0],
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
        { date: dateStr(3), time: "2:00 PM", confirmed: true, channel: "inbound" as const, purpose: "Property tour" },
      ],
    },
    {
      contact: contactIds[1],
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
        { date: dateStr(2), time: "4:00 PM", confirmed: true, channel: "inbound" as const, purpose: "Listing appointment" },
      ],
    },
    {
      contact: contactIds[2],
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
      contact: contactIds[3],
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
        { date: dateStr(4), time: "10:00 AM", confirmed: false, channel: "outbound" as const, purpose: "Listing consultation" },
      ],
    },
  ];

  const insertedLeads = await Lead.insertMany(leads as Parameters<typeof Lead.insertMany>[0]);

  const scheduleData = [
    { contact: contactIds[0], lead: insertedLeads[0]._id, date: dateStr(3), time: "2:00 PM", status: "confirmed" as const, purpose: "Property tour", channel: "inbound" as const },
    { contact: contactIds[1], lead: insertedLeads[1]._id, date: dateStr(2), time: "4:00 PM", status: "confirmed" as const, purpose: "Listing appointment", channel: "inbound" as const },
    { contact: contactIds[3], lead: insertedLeads[3]._id, date: dateStr(4), time: "10:00 AM", status: "proposed" as const, purpose: "Listing consultation", channel: "outbound" as const },
  ];
  await Schedule.insertMany(scheduleData);

  return { propertiesCount: properties.length, leadsCount: 4, contactsCount: contacts.length, schedulesCount: 3 };
}
