import { NextRequest, NextResponse } from "next/server";
import { parseMalpracticeCertFromBuffer } from "@/lib/malpracticeCertParser";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
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
        { error: "Invalid file type. Please upload a PDF, Word document, or image." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsed = await parseMalpracticeCertFromBuffer(buffer, file.type);

    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error("Malpractice cert parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse malpractice certificate. Please try again or fill in manually." },
      { status: 500 }
    );
  }
}
