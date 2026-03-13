import Anthropic from "@anthropic-ai/sdk";

export interface ParsedResume {
  firstName: string | null;
  lastName: string | null;
  credentials: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  education: {
    school: string;
    degree: string;
    major: string | null;
    graduationDate: string | null;
    city: string | null;
    state: string | null;
  }[];
  workHistory: {
    employer: string;
    address: string | null;
    title: string;
    startDate: string | null;
    endDate: string | null;
    isCurrent: boolean;
    supervisorName: string | null;
  }[];
  licenses: {
    type: string;
    number: string | null;
    state: string;
    issueDate: string | null;
    expiryDate: string | null;
  }[];
  confidence: number;
}

const RESUME_PARSE_PROMPT = `You are a resume parser for a behavioral health credentialing system. Extract structured data from the resume text below.

Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "firstName": "string or null",
  "lastName": "string or null",
  "credentials": "string or null (e.g., LPC, LCSW, LMFT)",
  "email": "string or null",
  "phone": "string or null",
  "address": "string or null",
  "education": [{"school": "string", "degree": "string", "major": "string or null", "graduationDate": "YYYY-MM or null", "city": "string or null", "state": "string or null"}],
  "workHistory": [{"employer": "string", "address": "string or null", "title": "string", "startDate": "YYYY-MM or null", "endDate": "YYYY-MM or null", "isCurrent": boolean, "supervisorName": "string or null"}],
  "licenses": [{"type": "string", "number": "string or null", "state": "string (2-letter)", "issueDate": "YYYY-MM or null", "expiryDate": "YYYY-MM or null"}],
  "confidence": number between 0 and 1
}

Rules:
- Extract ALL work history entries, ordered by date (most recent first)
- For dates, use YYYY-MM format when possible
- Set isCurrent=true for current/present positions
- Set confidence based on how much data you could extract (1.0 = everything clear, 0.5 = partial, 0.1 = mostly guessing)
- If a field cannot be determined, use null
- Focus on behavioral health credentials (LPC, LCSW, LMFT, LBP, LADC, PhD, PsyD)`;

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const mod = await import("pdf-parse");
  const pdfParse = "default" in mod ? (mod.default as (b: Buffer) => Promise<{ text: string }>) : (mod as unknown as (b: Buffer) => Promise<{ text: string }>);
  const data = await pdfParse(buffer);
  return data.text;
}

export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractTextFromFile(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    return extractTextFromPdf(buffer);
  }
  if (
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return extractTextFromDocx(buffer);
  }
  throw new Error(`Unsupported file type: ${mimeType}`);
}

export async function parseResumeWithClaude(
  resumeText: string
): Promise<ParsedResume> {
  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `${RESUME_PARSE_PROMPT}\n\n--- RESUME TEXT ---\n${resumeText}`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response format from Claude");
  }

  const parsed: ParsedResume = JSON.parse(content.text);
  return parsed;
}
