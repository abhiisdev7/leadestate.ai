import { tool } from "ai";
import { z } from "zod";
import { connectDB, Contact, Lead, Property, Schedule } from "@/lib/db";
import { getAvailableSlots } from "@/lib/db/availability";
import { buildPropertyQuery } from "@/lib/db/property-search";
import { sendMeetingSchedulerEmail } from "@/lib/email/send";

export function createTools(leadId: string | null) {
  return {
    update_lead: tool({
      description:
        "Create or update a lead in the CRM. Use when the user shares their name, phone, email, budget, location, timeline, intent, or readiness. Call frequently to keep lead data up to date.",
      inputSchema: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        status: z.string().optional(),
        budget: z.number().optional(),
        location: z.string().optional(),
        timeline: z.string().optional(),
        intent: z.enum(["buy", "sell", "both", "unknown"]).optional(),
        urgency: z.enum(["high", "medium", "low"]).optional(),
        readiness_score: z.number().min(0).max(10).optional(),
      }),
      execute: async (input) => {
        await connectDB();
        const update: Record<string, unknown> = { ...input };
        if (Object.keys(update).length === 0) return { success: false, message: "No fields to update" };

        let lead;
        if (leadId) {
          lead = await Lead.findByIdAndUpdate(
            leadId,
            { $set: update },
            { new: true }
          );
        } else {
          lead = await Lead.create({ ...update, status: "new" } as Record<string, unknown>);
        }
        if (!lead) return { success: false, message: "Lead not found" };
        return {
          success: true,
          lead_id: lead._id.toString(),
          message: "Lead updated",
        };
      },
    }),

    qualify_lead: tool({
      description:
        "Qualify a lead with intent, urgency, budget, location, timeline, and readiness score. Call when the user describes their buying/selling criteria.",
      inputSchema: z.object({
        intent: z.enum(["buy", "sell", "both", "unknown"]).optional(),
        urgency: z.enum(["high", "medium", "low"]).optional(),
        budget_range: z.string().optional(),
        budget_max: z.number().optional(),
        location: z.string().optional(),
        timeline: z.string().optional(),
        motivation: z.string().optional(),
        readiness_score: z.number().min(0).max(10).optional(),
      }),
      execute: async (input) => {
        await connectDB();
        const update: Record<string, unknown> = {};
        if (input.budget_max) update.budget = input.budget_max;
        if (input.location) update.location = input.location;
        if (input.timeline) update.timeline = input.timeline;
        if (input.intent) update.intent = input.intent;
        if (input.urgency) update.urgency = input.urgency;
        if (input.readiness_score !== undefined) update.readiness_score = input.readiness_score;
        update.status = "qualified";

        let lead;
        if (leadId) {
          lead = await Lead.findByIdAndUpdate(leadId, { $set: update }, { new: true });
        } else {
          lead = await Lead.create(update as Record<string, unknown>);
        }
        if (!lead) return { success: false, message: "Lead not found" };
        return {
          success: true,
          lead_id: lead._id.toString(),
          message: "Lead qualified",
        };
      },
    }),

    suggest_properties: tool({
      description:
        "Find matching properties from our inventory for a lead. Call after qualifying when you have budget and/or location. Supports formats like 'Austin', 'Austin TX', 'Austin, Texas'. Returns matching listings with IDs for linking.",
      inputSchema: z.object({
        budget_max: z.number().optional().describe("Maximum price in dollars"),
        budget_min: z.number().optional().describe("Minimum price in dollars"),
        location: z.string().optional().describe("City, state, or area e.g. Austin, Austin TX, Texas"),
        beds_min: z.number().optional().describe("Minimum bedrooms"),
        baths_min: z.number().optional().describe("Minimum bathrooms"),
        limit: z.number().min(1).max(5).optional(),
      }),
      execute: async (input) => {
        await connectDB();
        const query = buildPropertyQuery({
          budget_max: input.budget_max,
          budget_min: input.budget_min,
          location: input.location,
          beds_min: input.beds_min,
          baths_min: input.baths_min,
        });
        const limit = input.limit ?? 3;
        const properties = await Property.find(query).sort({ price: 1 }).limit(limit).lean() as Array<{
          _id: unknown;
          address: string;
          city: string;
          state: string;
          price: number;
          beds: number;
          baths: number;
          sqft?: number;
          features?: string[];
        }>;

        if (leadId) {
          await Lead.findByIdAndUpdate(leadId, {
            $set: { suggested_properties: properties.map((p) => p._id) },
          });
        }

        return {
          success: true,
          count: properties.length,
          properties: properties.map((p) => ({
            id: String(p._id),
            address: p.address,
            city: p.city,
            state: p.state,
            price: p.price,
            beds: p.beds,
            baths: p.baths,
            sqft: p.sqft,
            features: p.features,
          })),
        };
      },
    }),

    update_memory: tool({
      description:
        "Store personalization preferences for a lead: must-haves, deal-breakers, property interests, financing context. Call when the user shares preferences.",
      inputSchema: z.object({
        preferences: z
          .object({
            must_have: z.array(z.string()).optional(),
            deal_breakers: z.array(z.string()).optional(),
            preferred_areas: z.array(z.string()).optional(),
          })
          .optional(),
        property_interests: z.array(z.string()).optional(),
        financing_context: z.string().optional(),
      }),
      execute: async (input) => {
        if (!leadId) return { success: false, message: "No lead to update" };
        await connectDB();

        const lead = await Lead.findById(leadId);
        if (!lead) return { success: false, message: "Lead not found" };

        const memory = lead.memory ?? {};
        if (input.preferences) {
          memory.preferences = { ...memory.preferences, ...input.preferences };
        }
        if (input.property_interests) {
          memory.property_interests = [
            ...(memory.property_interests ?? []),
            ...input.property_interests,
          ];
        }
        if (input.financing_context) {
          memory.financing_context = input.financing_context;
        }

        await Lead.findByIdAndUpdate(leadId, { $set: { memory } });
        return { success: true, message: "Memory updated" };
      },
    }),

    get_available_slots: tool({
      description:
        "Get available appointment slots. Call when the user wants to schedule a call. Returns ONLY slots that are not already booked. Use these slots when proposing times.",
      inputSchema: z.object({
        limit: z.number().min(1).max(6).optional().describe("Max slots to return (default 6)"),
      }),
      execute: async (input) => {
        await connectDB();
        const slots = await getAvailableSlots(input.limit ?? 6);
        return {
          success: true,
          slots,
          message: `Found ${slots.length} available slot(s). Propose these to the user.`,
        };
      },
    }),

    propose_appointment: tool({
      description:
        "Propose appointment slots. MUST use slots from get_available_slots to ensure they are available. Call when the user wants to schedule – first call get_available_slots, then propose 2-3 of those slots to the user.",
      inputSchema: z.object({
        slots: z
          .array(
            z.object({
              date: z.string().describe("Date in YYYY-MM-DD format"),
              time: z.string().describe("Time e.g. 2:00 PM"),
            })
          )
          .min(1)
          .max(3)
          .describe("Slots from get_available_slots – only propose available slots"),
      }),
      execute: async (input) => {
        await connectDB();
        if (leadId) {
          await Lead.findByIdAndUpdate(leadId, {
            $set: { next_action: `Proposed: ${input.slots[0].date} at ${input.slots[0].time}` },
          });
        }
        return {
          success: true,
          slots: input.slots,
          message: `Proposed ${input.slots.length} available slot(s)`,
        };
      },
    }),

    schedule_call: tool({
      description:
        "Schedule a call and finalize the booking. Call ONLY when the user has confirmed a date/time AND you have their name, phone, AND email. Use a slot from get_available_slots. Creates Contact, Lead, and Schedule records. Email is REQUIRED.",
      inputSchema: z.object({
        name: z.string().describe("Lead's full name"),
        phone: z.string().describe("Lead's phone number"),
        email: z.string().email().describe("Lead's email address - REQUIRED"),
        date: z.string().describe("Date in YYYY-MM-DD format"),
        time: z.string().describe("Time e.g. 2:00 PM"),
        purpose: z.string().optional().describe("Purpose of the call e.g. Discovery call, Property tour"),
        channel: z.enum(["inbound", "outbound"]).optional().default("inbound"),
        budget: z.number().optional().describe("Lead's budget in dollars if known"),
        location: z.string().optional().describe("Lead's preferred location/area if known"),
        timeline: z.string().optional().describe("Lead's timeline e.g. within 1 week, 2-3 months"),
        readiness_score: z.number().min(0).max(10).optional().describe("Lead readiness 0-10 if known"),
        intent: z.enum(["buy", "sell", "both", "unknown"]).optional(),
      }),
      execute: async (input) => {
        await connectDB();

        let contact = await Contact.findOne({
          $or: [{ email: input.email }, ...(input.phone ? [{ phone: input.phone }] : [])],
        });

        if (!contact) {
          contact = await Contact.create({
            name: input.name,
            phone: input.phone,
            email: input.email,
            source: input.channel,
          });
        } else {
          await Contact.findByIdAndUpdate(contact._id, {
            $set: {
              name: input.name,
              phone: input.phone,
              email: input.email,
            },
          });
        }

        const baseSet: Record<string, unknown> = {
          contact: contact._id,
          name: input.name,
          phone: input.phone,
          email: input.email,
          channel: input.channel,
          status: "qualified",
          next_action: `Call scheduled – ${input.date} at ${input.time}`,
        };
        if (input.budget != null) baseSet.budget = input.budget;
        if (input.location != null) baseSet.location = input.location;
        if (input.timeline != null) baseSet.timeline = input.timeline;
        if (input.readiness_score != null) baseSet.readiness_score = input.readiness_score;
        if (input.intent != null) baseSet.intent = input.intent;

        let lead;
        if (leadId) {
          lead = await Lead.findByIdAndUpdate(leadId, { $set: baseSet }, { new: true });
        } else {
          lead = await Lead.create(baseSet as Record<string, unknown>);
        }

        if (!lead) return { success: false, message: "Failed to save lead", closeChat: false };

        await Schedule.create({
          contact: contact._id,
          lead: lead._id,
          date: input.date,
          time: input.time,
          status: "confirmed",
          purpose: input.purpose ?? "Discovery call",
          channel: input.channel,
        });

        await Lead.findByIdAndUpdate(lead._id, {
          $push: {
            appointments: {
              date: input.date,
              time: input.time,
              confirmed: true,
              channel: input.channel,
              purpose: input.purpose ?? "Discovery call",
            },
          },
        });

        let emailSent = false;
        if (input.channel === "inbound" && input.email) {
          try {
            await sendMeetingSchedulerEmail({
              to: input.email,
              leadName: input.name,
              date: input.date,
              time: input.time,
              purpose: input.purpose ?? "Discovery call",
            });
            emailSent = true;
          } catch (err) {
            console.error("Meeting email failed:", err);
          }
        }

        return {
          success: true,
          message: emailSent
            ? `Call scheduled for ${input.date} at ${input.time}. A confirmation email has been sent to ${input.email}.`
            : `Call scheduled for ${input.date} at ${input.time}.${!emailSent && input.channel === "inbound" ? " (Email could not be sent – please check SMTP config.)" : ""}`,
          closeChat: true,
          lead_id: lead._id.toString(),
          contact_id: contact._id.toString(),
        };
      },
    }),

    add_note: tool({
      description: "Add a note to the lead's CRM record. Use for objections, competitor mentions, or general notes.",
      inputSchema: z.object({
        content: z.string(),
        type: z.enum(["objection", "competitor", "general"]).optional(),
      }),
      execute: async (input) => {
        if (!leadId) return { success: false, message: "No lead" };
        await connectDB();

        const lead = await Lead.findById(leadId);
        if (!lead) return { success: false, message: "Lead not found" }

        const memory = lead.memory ?? {};
        memory.notes = [...(memory.notes ?? []), input.content];
        if (input.type === "objection") {
          memory.objections_raised = [...(memory.objections_raised ?? []), input.content];
        }
        await Lead.findByIdAndUpdate(leadId, { $set: { memory } });

        return { success: true, message: "Note added" };
      },
    }),

    call_insights: tool({
      description:
        "Generate end-of-call insights: summary, objections, action items, next best action. Call when wrapping up a conversation.",
      inputSchema: z.object({
        summary: z.string(),
        objections: z.array(z.string()).optional(),
        action_items: z.array(z.string()).optional(),
        next_best_action: z.string(),
      }),
      execute: async (input) => {
        if (!leadId) return { success: true, message: "Insights recorded (no lead)" };
        await connectDB();

        await Lead.findByIdAndUpdate(leadId, {
          $set: {
            call_insights: input,
            next_action: input.next_best_action,
          },
        });

        return { success: true, message: "Call insights saved" };
      },
    }),
  };
}
