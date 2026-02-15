import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

const IntentSchema = z.object({
  intent: z.enum(["cancel", "reschedule", "other"]),
});

export type EmailIntent = z.infer<typeof IntentSchema>["intent"];

export async function classifyEmailIntent(
  subject: string,
  body: string
): Promise<EmailIntent> {
  const model = google("gemini-2.5-flash");

  const { object } = await generateObject({
    model,
    schema: IntentSchema,
    prompt: `You are classifying email replies to a meeting confirmation. The customer received an email confirming their scheduled call and has replied.

Subject: ${subject}

Body:
${body.slice(0, 2000)}

Classify the intent of this reply:
- "cancel": The customer wants to cancel the scheduled meeting (e.g. "please cancel", "I need to cancel", "cancel my appointment", "won't be able to make it", "something came up, need to cancel")
- "reschedule": The customer wants to reschedule to a different time (e.g. "can we move it", "different time works better", "reschedule for next week")
- "other": Any other intent (questions, confirmations, thanks, unrelated, unclear)

Reply with JSON: { "intent": "cancel" | "reschedule" | "other" }`,
  });

  return object.intent;
}
