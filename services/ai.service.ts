import { generateText, generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";
import { Env } from "~/configs/env.config.ts";
import type { EmailClassification } from "~/types/email.types.ts";
import type { IProperty } from "~/types/property.types.ts";

const openai = createOpenAI({ apiKey: Env.OPENAI_API_KEY });

const BUYER_SYSTEM_PROMPT = `You are a professional US real estate agent assistant. You respond to inbound leads via email with warmth, expertise, and clarity.

Your goals:
- Acknowledge their inquiry promptly
- Qualify their intent (buyer, seller, or both) when relevant
- Answer property questions, financing context, or next steps
- Keep responses concise (2-4 short paragraphs) and actionable
- Sign off professionally without being overly salesy

Do not make up property listings or prices. If they ask about specific properties, suggest they share their criteria so you can help match them.`;

const SELLER_SYSTEM_PROMPT = `You are a professional US real estate agent assistant helping sellers list their property. Your goal is to collect property details via email conversation.

Gather: address, beds, baths, sqft, price expectation, condition, timeline. Ask for missing details naturally. When you have address and basic info (or after 4-5 exchanges), suggest scheduling a call for a listing consultation. Keep responses warm and concise.`;

const classificationSchema = z.object({
  classification: z.enum(["buyer_lead", "seller_lead", "general_inquiry", "spam", "unknown"]),
});

const propertyExtractionSchema = z.object({
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  sqft: z.number().optional(),
  priceExpectation: z.number().optional(),
  condition: z.string().optional(),
  timeline: z.string().optional(),
});

export async function classifyInboundEmail(params: {
  from: string;
  subject?: string;
  bodyText?: string;
}): Promise<EmailClassification> {
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: classificationSchema,
    prompt: `Classify this email as one of: buyer_lead, seller_lead, general_inquiry, spam, unknown.

From: ${params.from}
Subject: ${params.subject ?? "(no subject)"}
Message:
${params.bodyText ?? "(no message body)"}

Return the classification.`,
  });
  return object.classification as EmailClassification;
}

export async function extractPropertyDetailsFromMessage(params: {
  bodyText?: string;
}): Promise<Partial<IProperty>> {
  if (!params.bodyText?.trim()) return {};
  const { object } = await generateObject({
    model: openai("gpt-4o-mini"),
    schema: propertyExtractionSchema,
    prompt: `Extract any property details from this message. Return only fields that are explicitly mentioned. Use numbers for beds, baths, sqft, priceExpectation.

Message:
${params.bodyText}`,
  });
  const result: Partial<IProperty> = {};
  if (object.address) result.address = object.address;
  if (object.city) result.city = object.city;
  if (object.state) result.state = object.state;
  if (object.zip) result.zip = object.zip;
  if (object.beds != null) result.beds = object.beds;
  if (object.baths != null) result.baths = object.baths;
  if (object.sqft != null) result.sqft = object.sqft;
  if (object.priceExpectation != null) result.priceExpectation = object.priceExpectation;
  if (object.condition) result.condition = object.condition;
  if (object.timeline) result.timeline = object.timeline;
  return result;
}

export async function generateLeadResponse(params: {
  from: string;
  subject?: string;
  bodyText?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  classification?: EmailClassification;
  suggestedProperties?: Array<{ address?: string; price?: number; beds?: number; baths?: number }>;
  exchangeCount?: number;
}): Promise<string> {
  const historyStr =
    params.conversationHistory?.length
      ? params.conversationHistory
        .map((m) => `${m.role === "user" ? "Customer" : "Agent"}: ${m.content}`)
        .join("\n\n")
      : "";

  const propsStr =
    params.suggestedProperties?.length
      ? params.suggestedProperties
        .map(
          (p) =>
            `- ${p.address ?? "N/A"} | $${p.price ?? "?"} | ${p.beds ?? "?"} beds, ${p.baths ?? "?"} baths`
        )
        .join("\n")
      : "";

  const callCta =
    (params.exchangeCount ?? 0) >= 4
      ? "\n\nIf the lead seems engaged, suggest scheduling a call to discuss further."
      : "";

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: BUYER_SYSTEM_PROMPT,
    prompt: `A lead just emailed you. Generate a professional reply.

From: ${params.from}
Subject: ${params.subject ?? "(no subject)"}
${historyStr ? `Previous conversation:\n${historyStr}\n\n` : ""}
Latest message:
${params.bodyText ?? "(no message body)"}
${propsStr ? `\nAvailable properties to suggest:\n${propsStr}` : ""}
${callCta}

Write a helpful, professional email response. Use plain text only, no HTML.`,
  });

  return text;
}

export async function generateSellerLeadResponse(params: {
  from: string;
  subject?: string;
  bodyText?: string;
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
  existingProperty?: Partial<IProperty>;
  exchangeCount?: number;
}): Promise<string> {
  const historyStr =
    params.conversationHistory?.length
      ? params.conversationHistory
        .map((m) => `${m.role === "user" ? "Customer" : "Agent"}: ${m.content}`)
        .join("\n\n")
      : "";

  const existingStr = params.existingProperty
    ? `Already collected: ${JSON.stringify(params.existingProperty)}`
    : "";

  const callCta =
    (params.exchangeCount ?? 0) >= 4
      ? " Consider suggesting a call for a listing consultation."
      : "";

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: SELLER_SYSTEM_PROMPT,
    prompt: `A seller lead emailed you. Generate a professional reply.

From: ${params.from}
Subject: ${params.subject ?? "(no subject)"}
${historyStr ? `Previous conversation:\n${historyStr}\n\n` : ""}
${existingStr ? `\n${existingStr}\n\n` : ""}
Latest message:
${params.bodyText ?? "(no message body)"}
${callCta}

Write a helpful, professional email response. Use plain text only, no HTML.`,
  });

  return text;
}
