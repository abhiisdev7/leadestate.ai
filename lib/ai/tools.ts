import { tool } from "ai";
import { z } from "zod";
import { connectDB, Lead, Property } from "@/lib/db";
import { sendMeetingSchedulerEmail } from "@/lib/email/send";

export function createTools(leadId: string | null) {
  return {
    update_lead: tool({
      description:
        "Create or update a lead in the CRM. Use when the user shares their name, phone, email, or other contact info.",
      inputSchema: z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        status: z.string().optional(),
        budget: z.number().optional(),
        location: z.string().optional(),
        timeline: z.string().optional(),
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
        "Find matching properties from our inventory for a lead. Call after qualifying when you have budget and location. Returns matching listings.",
      inputSchema: z.object({
        budget_max: z.number().optional(),
        location: z.string().optional(),
        limit: z.number().min(1).max(5).optional(),
      }),
      execute: async (input) => {
        await connectDB();
        const conditions: Record<string, unknown>[] = [
          { $or: [{ status: { $exists: false } }, { status: "active" }] },
        ];
        if (input.budget_max) conditions.push({ price: { $lte: input.budget_max } });
        if (input.location) {
          conditions.push({
            $or: [
              { city: new RegExp(input.location, "i") },
              { state: new RegExp(input.location, "i") },
            ],
          });
        }
        const query = conditions.length > 1 ? { $and: conditions } : conditions[0];
        const limit = input.limit ?? 3;
        const properties = await Property.find(query).limit(limit).lean() as Array<{
          _id: unknown;
          address: string;
          city: string;
          price: number;
          beds: number;
          baths: number;
          features?: string[];
        }>;

        if (leadId) {
          await Lead.findByIdAndUpdate(leadId, {
            $set: { suggested_properties: properties.map((p) => p._id) },
          });
        }

        return {
          success: true,
          properties: properties.map((p) => ({
            address: p.address,
            city: p.city,
            price: p.price,
            beds: p.beds,
            baths: p.baths,
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

    propose_appointment: tool({
      description: "Propose appointment slots to the lead. Call when the user wants to schedule a call.",
      inputSchema: z.object({
        slots: z.array(
          z.object({
            date: z.string().describe("Date in YYYY-MM-DD format"),
            time: z.string().describe("Time e.g. 2:00 PM"),
          })
        ),
      }),
      execute: async (input) => {
        await connectDB();
        const appointments = input.slots.map((s) => ({
          date: s.date,
          time: s.time,
          confirmed: false,
        }));

        if (leadId) {
          await Lead.findByIdAndUpdate(leadId, {
            $set: { appointments, next_action: `Proposed: ${input.slots[0].date} at ${input.slots[0].time}` },
          });
        }

        return {
          success: true,
          slots: input.slots,
          message: `Proposed ${input.slots.length} slot(s)`,
        };
      },
    }),

    confirm_appointment: tool({
      description: "Confirm an appointment slot. Call when the user agrees to a proposed slot.",
      inputSchema: z.object({
        slot_index: z.number().describe("Index of the slot (0-based)"),
      }),
      execute: async (input) => {
        if (!leadId) return { success: false, message: "No lead" };
        await connectDB();

        const lead = await Lead.findById(leadId);
        if (!lead?.appointments?.length) return { success: false, message: "No appointments" };

        const idx = input.slot_index;
        if (idx < 0 || idx >= lead.appointments.length) {
          return { success: false, message: "Invalid slot index" };
        }

        lead.appointments[idx].confirmed = true;
        const slot = lead.appointments[idx];
        lead.next_action = `Call scheduled – ${slot.date} at ${slot.time}`;
        await lead.save();

        return {
          success: true,
          message: `Confirmed: ${slot.date} at ${slot.time}`,
        };
      },
    }),

    schedule_call: tool({
      description:
        "Schedule a call and finalize the booking. Call ONLY when the user has confirmed a date/time AND you have their name, phone, AND email. Email is REQUIRED before scheduling. For inbound leads (voice chat), this creates the lead, stores the appointment, sends a meeting confirmation email, and closes the chat.",
      inputSchema: z.object({
        name: z.string().describe("Lead's full name"),
        phone: z.string().describe("Lead's phone number"),
        email: z.string().email().describe("Lead's email address - REQUIRED"),
        date: z.string().describe("Date in YYYY-MM-DD format"),
        time: z.string().describe("Time e.g. 2:00 PM"),
        purpose: z.string().optional().describe("Purpose of the call e.g. Discovery call, Property tour"),
        channel: z.enum(["inbound", "outbound"]).optional().default("inbound"),
      }),
      execute: async (input) => {
        await connectDB();

        const appointment = {
          date: input.date,
          time: input.time,
          confirmed: true,
          channel: input.channel as "inbound" | "outbound",
          purpose: input.purpose ?? "Discovery call",
        };

        let lead;
        if (leadId) {
          lead = await Lead.findByIdAndUpdate(
            leadId,
            {
              $set: {
                name: input.name,
                phone: input.phone,
                email: input.email,
                channel: input.channel,
                status: "qualified",
                next_action: `Call scheduled – ${input.date} at ${input.time}`,
              },
              $push: { appointments: appointment },
            },
            { new: true }
          );
        } else {
          lead = await Lead.create({
            name: input.name,
            phone: input.phone,
            email: input.email,
            channel: input.channel,
            status: "qualified",
            next_action: `Call scheduled – ${input.date} at ${input.time}`,
            appointments: [appointment],
          } as Record<string, unknown>);
        }

        if (!lead) return { success: false, message: "Failed to save lead", closeChat: false };

        if (input.channel === "inbound" && input.email) {
          sendMeetingSchedulerEmail({
            to: input.email,
            leadName: input.name,
            date: input.date,
            time: input.time,
            purpose: input.purpose ?? "Discovery call",
          }).catch((err) => console.error("Meeting email failed:", err));
        }

        return {
          success: true,
          message: `Call scheduled for ${input.date} at ${input.time}. A confirmation email has been sent to ${input.email}.`,
          closeChat: true,
          lead_id: lead._id.toString(),
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
