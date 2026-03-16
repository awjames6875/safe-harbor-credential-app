import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendWelcomeEmail } from "@/lib/email";
import { requireUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  await requireUser();

  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.inviteUserByEmail(email);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  sendWelcomeEmail(email).catch(() => {});

  return NextResponse.json({ success: true });
}
