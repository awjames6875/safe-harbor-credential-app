import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const clinicianId = request.nextUrl.searchParams.get("clinician_id");
  if (!clinicianId) {
    return NextResponse.json({ error: "clinician_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clinician_notes")
    .select("*")
    .eq("clinician_id", clinicianId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { clinician_id, note } = body;

  if (!clinician_id || !note?.trim()) {
    return NextResponse.json({ error: "clinician_id and note are required" }, { status: 400 });
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clinician_notes")
    .insert({
      clinician_id,
      note: note.trim(),
      created_by: user?.email ?? "unknown",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
