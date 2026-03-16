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

  // Redirect based on role
  const role = data.session?.user?.app_metadata?.role;
  if (role === "admin") {
    return NextResponse.redirect(new URL("/admin", origin));
  }
  if (role === "clinician") {
    return NextResponse.redirect(new URL("/clinician", origin));
  }

  return NextResponse.redirect(new URL("/", origin));
}
