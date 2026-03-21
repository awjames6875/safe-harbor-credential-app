import Anthropic from "@anthropic-ai/sdk";
import { extractTextFromFile } from "./resumeParser";

export interface ParsedLicense {
  licenseType: string | null;
  licenseNumber: string | null;
  licenseState: string | null;
  licenseIssued: string | null;
  licenseExpiry: string | null;
  confidence: number;
}

const LICENSE_PARSE_PROMPT = `You are a document parser for a behavioral health credentialing system. Extract license information from the document provided.

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "licenseType": "string or null (e.g., LPC, LCSW, LMFT, LBP, LADC, MD, DO, PhD, PsyD)",
  "licenseNumber": "string or null",
  "licenseState": "string (2-letter state code) or null",
  "licenseIssued": "YYYY-MM-DD or null",
  "licenseExpiry": "YYYY-MM-DD or null",
  "confidence": number between 0 and 1
}

Rules:
- Focus on behavioral health license types (LPC, LCSW, LMFT, LBP, LADC, PhD, PsyD)
- For dates, use YYYY-MM-DD format
- Use 2-letter state abbreviation (e.g., TX, CA, NY)
- Set confidence based on how clearly you can read the document
- If a field cannot be determined, use null`;

export async function parseLicenseWithClaude(
  input: { type: "image"; base64: string; mediaType: string } | { type: "text"; text: string }
): Promise<ParsedLicense> {
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
          { type: "text" as const, text: LICENSE_PARSE_PROMPT },
        ]
      : `${LICENSE_PARSE_PROMPT}\n\n--- DOCUMENT TEXT ---\n${input.text}`;

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
  try {
    return JSON.parse(jsonText) as ParsedLicense;
  } catch {
    console.error("License parse JSON error. Raw response:", block.text);
    return {
      licenseType: null, licenseNumber: null, licenseState: null,
      licenseIssued: null, licenseExpiry: null, confidence: 0,
    };
  }
}

export async function parseLicenseFromBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<ParsedLicense> {
  if (mimeType === "image/jpeg" || mimeType === "image/png") {
    const base64 = buffer.toString("base64");
    return parseLicenseWithClaude({ type: "image", base64, mediaType: mimeType });
  }

  const text = await extractTextFromFile(buffer, mimeType);
  return parseLicenseWithClaude({ type: "text", text });
}
