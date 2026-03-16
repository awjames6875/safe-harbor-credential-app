import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await requireUser();

  const { email, role = "clinician" } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (role !== "clinician" && role !== "admin") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Set role in app_metadata (secure — users cannot change this themselves)
  if (data?.user?.id) {
    await supabase.auth.admin.updateUserById(data.user.id, {
      app_metadata: { role },
    });
  }

  sendWelcomeEmail(email).catch(() => {});

  return NextResponse.json({ success: true });
}
