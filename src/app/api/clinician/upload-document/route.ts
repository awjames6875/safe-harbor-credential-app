import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const docType = formData.get("docType") as string | null;
    const clinicianId = formData.get("clinicianId") as string | null;

    if (!file || !docType) {
      return NextResponse.json(
        { error: "File and docType are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Build storage path: clinician-docs/{clinicianId}/{docType}-{timestamp}.{ext}
    const ext = file.name.split(".").pop() || "pdf";
    const timestamp = Date.now();
    const folder = clinicianId || "pending";
    const storagePath = `clinician-docs/${folder}/${docType}-${timestamp}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      url: urlData.publicUrl,
      storagePath,
      fileName: file.name,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}
