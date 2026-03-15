import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin routes — redirect to /login if not authenticated
  if (!user && request.nextUrl.pathname.startsWith("/admin")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Protect /clinician routes — redirect to /clinician/login if not authenticated
  const isClinicianRoute = request.nextUrl.pathname.startsWith("/clinician");
  const isClinicianPublic =
    request.nextUrl.pathname === "/clinician/login" ||
    request.nextUrl.pathname.startsWith("/clinician/success");
  if (!user && isClinicianRoute && !isClinicianPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/clinician/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
