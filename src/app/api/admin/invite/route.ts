import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInviteEmail } from "@/lib/email";
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

  // Generate invite link WITHOUT Supabase sending email (bypasses rate limits)
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "invite",
    email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Set role in app_metadata
  if (data?.user?.id) {
    await supabase.auth.admin.updateUserById(data.user.id, {
      app_metadata: { role },
    });
  }

  // Use the action_link from Supabase — it goes through Supabase's verify
  // endpoint which then redirects to our /auth/callback with the proper code
  const inviteLink = data.properties?.action_link;

  // Send invite email via Resend
  try {
    await sendInviteEmail(email, inviteLink, role);
  } catch (emailError: unknown) {
    const message = emailError instanceof Error ? emailError.message : "Unknown email error";
    console.error("Failed to send invite email:", message);
    return NextResponse.json({ error: `User created but email failed: ${message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
