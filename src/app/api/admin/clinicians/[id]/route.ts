import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from("clinicians")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Clinician delete error:", error);
      return NextResponse.json({ error: "Failed to delete clinician" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Clinician DELETE error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
