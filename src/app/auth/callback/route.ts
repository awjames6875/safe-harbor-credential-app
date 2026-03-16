import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const type = searchParams.get("type");
  const role = data.session?.user?.app_metadata?.role;

  // Invite or signup flow — send new users to set their password first
  if (type === "invite" || type === "signup") {
    return NextResponse.redirect(new URL("/reset-password", origin));
  }

  // Password recovery flow
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/reset-password", origin));
  }

  // Normal auth — redirect based on role
  if (role === "admin") {
    return NextResponse.redirect(new URL("/admin", origin));
  }
  if (role === "clinician") {
    return NextResponse.redirect(new URL("/clinician", origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
