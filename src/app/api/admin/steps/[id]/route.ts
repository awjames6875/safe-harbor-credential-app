import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: step } = await supabase
    .from("credentialing_steps")
    .select("is_completed")
    .eq("id", id)
    .single();

  if (!step) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("credentialing_steps")
    .update({
      is_completed: !step.is_completed,
      completed_at: !step.is_completed ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, is_completed: !step.is_completed });
}
