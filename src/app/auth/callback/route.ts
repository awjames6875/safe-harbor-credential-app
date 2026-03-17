import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  // Get email server-side so the create-password page doesn't need
  // to rely on client-side session detection
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";

  return NextResponse.redirect(new URL(`/create-password${email}`, origin));
}
