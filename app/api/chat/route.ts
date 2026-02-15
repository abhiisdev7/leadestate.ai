import { streamText, convertToModelMessages, stepCountIs, type UIMessage } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { connectDB, Lead } from "@/lib/db";
import { createTools } from "@/lib/ai/tools";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a friendly, professional real estate assistant for a US brokerage. You handle inbound buyer/seller inquiries and help qualify leads.

Your goals:
- First, confirm intent: are they a buyer, seller, or both? Call qualify_lead with intent as soon as you know.
- Qualify leads: get budget, location, timeline, and motivation
- For buyers: when you have budget and/or location, call suggest_properties with budget_max and location (e.g. "Austin", "Austin TX", "Texas"). Mention 1-2 matching properties to the user, including their IDs if you want to link to details.
- For sellers: ask about their property, timeline, and motivation
- Capture contact info: you MUST collect name, phone, AND email. Email is REQUIRED before scheduling any call. Always ask for email explicitly (e.g. "What's the best email to send the meeting confirmation to?").
- When the user wants to schedule a call: first ensure you have name, phone, AND email. If email is missing, ask for it before proceeding.
- For scheduling: FIRST call get_available_slots to get only available times. THEN call propose_appointment with 2-3 of those slots. When the user confirms a slot AND you have name, phone, AND email, call schedule_call with the chosen date and time. ALWAYS pass budget, location, timeline, readiness_score, and intent if known.
- Store preferences and objections in memory for personalization

Be conversational, not scripted. Ask one question at a time. Use the tools to update the CRM as you learn information. When the user shares preferences (e.g. "I need a backyard", "no HOA"), call update_memory. When wrapping up, call call_insights with a summary and next_best_action.`;

function buildSystemPrompt(leadContext: string): string {
  return `${SYSTEM_PROMPT}

${leadContext}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, lead_id: clientLeadId } = body as {
      messages: UIMessage[];
      lead_id?: string | null;
    };

    await connectDB();

    let leadId: string | null = clientLeadId ?? null;

    if (!leadId) {
      const newLead = await Lead.create({ status: "new" });
      leadId = newLead._id.toString();
    }

    const lead = await Lead.findById(leadId).lean();
    let leadContext = "This is a new visitor. Create a lead when you have enough info (name or contact).";

    if (lead) {
      const parts: string[] = [
        `Lead: ${lead.name ?? "Unknown"} | Status: ${lead.status}`,
      ];
      if (lead.budget) parts.push(`Budget: $${lead.budget}`);
      if (lead.location) parts.push(`Location: ${lead.location}`);
      if (lead.timeline) parts.push(`Timeline: ${lead.timeline}`);
      if (lead.memory?.preferences?.must_have?.length) {
        parts.push(`Must-have: ${lead.memory.preferences.must_have.join(", ")}`);
      }
      if (lead.memory?.objections_raised?.length) {
        parts.push(`Past objections: ${lead.memory.objections_raised.join("; ")}`);
      }
      leadContext = `[Lead context] ${parts.join(". ")}. Use this to personalize.`;
    }

    const result = streamText({
      model: google("gemini-2.5-pro"),
      system: buildSystemPrompt(leadContext),
      messages: await convertToModelMessages(messages),
      tools: createTools(leadId),
      stopWhen: stepCountIs(5),
    });

    const response = result.toUIMessageStreamResponse();
    response.headers.set("X-Lead-Id", leadId);
    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
