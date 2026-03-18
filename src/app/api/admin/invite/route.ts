import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInviteEmail } from "@/lib/email";
import { requireUser } from "@/lib/auth";
import crypto from "crypto";

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

  // Generate a temporary password — user logs in with this, can change later
  const tempPassword = crypto.randomBytes(6).toString("base64url");

  // Create user with the temporary password (no redirect chain needed)
  const { error } = await supabase.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    app_metadata: { role },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://safe-harbor-credential-app.vercel.app";
  const loginUrl = role === "clinician"
    ? `${appUrl}/clinician/login`
    : `${appUrl}/login`;

  // Send invite email with temporary password and login link
  try {
    await sendInviteEmail(email, tempPassword, loginUrl, role);
  } catch (emailError: unknown) {
    const message = emailError instanceof Error ? emailError.message : "Unknown email error";
    console.error("Failed to send invite email:", message);
    return NextResponse.json({ error: `User created but email failed: ${message}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
