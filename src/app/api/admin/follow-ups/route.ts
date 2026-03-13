import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function GET() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("follow_ups")
    .select("*, payer_applications(payer_name, clinician_id, clinicians(first_name, last_name))")
    .lte("due_date", today)
    .is("completed_date", null)
    .order("due_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { payer_application_id, notes, contact_method, contact_person, next_follow_up_date } = body;

  const supabase = await createClient();

  const user = await getUser();
  const userEmail = user?.email ?? "unknown";

  // Insert the follow-up record with who logged it
  const { error: insertError } = await supabase.from("follow_ups").insert({
    payer_application_id,
    due_date: next_follow_up_date,
    notes: notes ? `${notes} (logged by ${userEmail})` : `(logged by ${userEmail})`,
    contact_method,
    contact_person: contact_person || userEmail,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Update the parent payer application
  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("payer_applications")
    .update({
      last_follow_up: now,
      follow_up_date: next_follow_up_date,
      updated_at: now,
    })
    .eq("id", payer_application_id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
