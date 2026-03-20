import Anthropic from "@anthropic-ai/sdk";
import { extractTextFromFile } from "./resumeParser";

export interface ParsedMalpracticeCert {
  malpracticeCarrier: string | null;
  malpracticePolicy: string | null;
  malpracticePerClaim: string | null;
  malpracticeAggregate: string | null;
  malpracticeStart: string | null;
  malpracticeEnd: string | null;
  confidence: number;
}

const MALPRACTICE_PARSE_PROMPT = `You are a document parser for a behavioral health credentialing system. Extract malpractice/professional liability insurance information from the document provided.

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "malpracticeCarrier": "string or null (insurance company name)",
  "malpracticePolicy": "string or null (policy number)",
  "malpracticePerClaim": "string or null (per-claim coverage amount, e.g., '1000000')",
  "malpracticeAggregate": "string or null (aggregate coverage amount, e.g., '3000000')",
  "malpracticeStart": "YYYY-MM-DD or null (policy effective date)",
  "malpracticeEnd": "YYYY-MM-DD or null (policy expiration date)",
  "confidence": number between 0 and 1
}

Rules:
- Extract dollar amounts as plain numbers without $ or commas (e.g., "1000000" not "$1,000,000")
- For dates, use YYYY-MM-DD format
- Look for: carrier/insurer name, policy number, per-occurrence/per-claim limit, aggregate limit, effective dates
- Set confidence based on how clearly you can read the document
- If a field cannot be determined, use null`;

export async function parseMalpracticeCertWithClaude(
  input: { type: "image"; base64: string; mediaType: string } | { type: "text"; text: string }
): Promise<ParsedMalpracticeCert> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] =
    input.type === "image"
      ? [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: input.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: input.base64,
            },
          },
          { type: "text" as const, text: MALPRACTICE_PARSE_PROMPT },
        ]
      : `${MALPRACTICE_PARSE_PROMPT}\n\n--- DOCUMENT TEXT ---\n${input.text}`;

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    messages: [{ role: "user", content }],
  });

  const block = response.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response format from Claude");
  }

  const jsonText = block.text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  return JSON.parse(jsonText) as ParsedMalpracticeCert;
}

export async function parseMalpracticeCertFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedMalpracticeCert> {
  if (mimeType === "image/jpeg" || mimeType === "image/png") {
    const base64 = buffer.toString("base64");
    return parseMalpracticeCertWithClaude({ type: "image", base64, mediaType: mimeType });
  }

  const text = await extractTextFromFile(buffer, mimeType);
  return parseMalpracticeCertWithClaude({ type: "text", text });
}
