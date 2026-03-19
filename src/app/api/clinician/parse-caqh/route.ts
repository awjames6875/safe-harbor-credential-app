import { NextRequest, NextResponse } from "next/server";
import { extractTextFromFile } from "@/lib/resumeParser";
import { parseCaqhWithClaude } from "@/lib/caqhParser";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a PDF or Word document." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromFile(buffer, file.type);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from file. Please try a different format." },
        { status: 400 }
      );
    }

    const parsed = await parseCaqhWithClaude(text);

    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("CAQH parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse CAQH profile. Please try again or fill in manually." },
      { status: 500 }
    );
  }
}
