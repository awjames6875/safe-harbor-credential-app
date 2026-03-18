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

  // Get email and role server-side for the create-password page
  const { data: { user } } = await supabase.auth.getUser();
  const params = new URLSearchParams();
  if (user?.email) params.set("email", user.email);
  if (user?.app_metadata?.role) params.set("role", user.app_metadata.role);
  const qs = params.toString() ? `?${params.toString()}` : "";

  return NextResponse.redirect(new URL(`/create-password${qs}`, origin));
}
