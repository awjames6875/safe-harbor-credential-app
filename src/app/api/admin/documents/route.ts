import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const ownerType = searchParams.get("ownerType");

    let query = supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });

    if (ownerType) {
      query = query.eq("owner_type", ownerType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Documents fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Documents GET error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const ownerType = formData.get("ownerType") as string;
    const ownerId = formData.get("ownerId") as string | null;
    const documentType = formData.get("documentType") as string;
    const expiryDate = formData.get("expiryDate") as string | null;
    const notes = formData.get("notes") as string | null;

    if (!file || !ownerType || !documentType) {
      return NextResponse.json(
        { error: "File, ownerType, and documentType are required" },
        { status: 400 }
      );
    }

    // Upload to storage
    const ext = file.name.split(".").pop() || "pdf";
    const storagePath = `${ownerType}-docs/${ownerId || "org"}/${documentType}-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, buffer, { contentType: file.type, upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from("documents")
      .getPublicUrl(storagePath);

    // Insert document record
    const { data, error } = await supabase
      .from("documents")
      .insert({
        owner_type: ownerType,
        owner_id: ownerId || null,
        document_type: documentType,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
        expiry_date: expiryDate || null,
        notes: notes || null,
        uploaded_by: "admin",
      })
      .select()
      .single();

    if (error) {
      console.error("Document insert error:", error);
      return NextResponse.json({ error: "Failed to save document record" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Documents POST error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
