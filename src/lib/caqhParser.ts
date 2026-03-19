import Anthropic from "@anthropic-ai/sdk";
import type { ParsedResume } from "./resumeParser";

export interface ParsedCaqh extends ParsedResume {
  caqhId: string | null;
  malpractice: {
    carrier: string | null;
    policyNumber: string | null;
    perClaim: string | null;
    aggregate: string | null;
    startDate: string | null;
    endDate: string | null;
  } | null;
}

const CAQH_PARSE_PROMPT = `You are a CAQH ProView PDF parser for a behavioral health credentialing system. Extract structured data from the CAQH profile text below.

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "caqhId": "string (8 digits) or null",
  "firstName": "string or null",
  "lastName": "string or null",
  "credentials": "string or null (e.g., LPC, LCSW, LMFT)",
  "email": "string or null",
  "phone": "string or null",
  "address": "string or null",
  "education": [{"school": "string", "degree": "string", "major": "string or null", "graduationDate": "YYYY-MM or null", "city": "string or null", "state": "string or null"}],
  "workHistory": [{"employer": "string", "address": "string or null", "title": "string", "startDate": "YYYY-MM or null", "endDate": "YYYY-MM or null", "isCurrent": boolean, "supervisorName": "string or null"}],
  "licenses": [{"type": "string", "number": "string or null", "state": "string (2-letter)", "issueDate": "YYYY-MM or null", "expiryDate": "YYYY-MM or null"}],
  "npiNumber": "string (10 digits) or null",
  "references": [{"name": "string", "title": "string", "specialty": "string or null", "phone": "string or null", "email": "string or null"}],
  "malpractice": {
    "carrier": "string or null",
    "policyNumber": "string or null",
    "perClaim": "string (dollar amount) or null",
    "aggregate": "string (dollar amount) or null",
    "startDate": "YYYY-MM-DD or null",
    "endDate": "YYYY-MM-DD or null"
  },
  "confidence": number between 0 and 1
}

Rules:
- Look for CAQH Provider ID (8-digit number) in headers or identification sections
- Extract ALL work history entries, ordered by date (most recent first)
- For dates, use YYYY-MM format for education/work, YYYY-MM-DD for insurance dates
- Set isCurrent=true for current/present positions
- Set confidence based on how much data you could extract (1.0 = everything clear, 0.5 = partial, 0.1 = mostly guessing)
- If a field cannot be determined, use null
- Focus on behavioral health credentials (LPC, LCSW, LMFT, LBP, LADC, PhD, PsyD)
- Extract NPI number (10-digit National Provider Identifier) if listed
- Extract professional liability/malpractice insurance details including carrier, policy number, and coverage amounts
- Extract professional references with name, title, specialty, phone, and email
- CAQH profiles typically have sections: Personal Information, Professional IDs, Education & Training, Specialties, Work History, Professional Liability Insurance, Professional References`;

export async function parseCaqhWithClaude(
  caqhText: string
): Promise<ParsedCaqh> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `${CAQH_PARSE_PROMPT}\n\n--- CAQH PROFILE TEXT ---\n${caqhText}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response format from Claude");
  }

  const jsonText = content.text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  const parsed: ParsedCaqh = JSON.parse(jsonText);
  return parsed;
}
