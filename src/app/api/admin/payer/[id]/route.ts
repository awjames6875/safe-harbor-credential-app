import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const supabase = await createClient();

  const user = await getUser();
  const userEmail = user?.email ?? "unknown";

  // Auto-set recredentialing_due when status changes to Approved/Active
  if (
    (body.status === "Approved" || body.status === "Active") &&
    !body.recredentialing_due
  ) {
    const baseDate = body.approval_date || new Date().toISOString().split("T")[0];
    const dueDate = new Date(baseDate);
    dueDate.setFullYear(dueDate.getFullYear() + 3);
    body.recredentialing_due = dueDate.toISOString().split("T")[0];
  }

  // Append who made the update to notes
  const existingNotes = body.notes ?? "";
  const updatedNotes = existingNotes
    ? `${existingNotes} (updated by ${userEmail})`
    : `(updated by ${userEmail})`;

  const { error } = await supabase
    .from("payer_applications")
    .update({ ...body, notes: updatedNotes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
