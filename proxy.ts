import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { requireEnv } from "@/lib/utils";

export async function proxy(request: NextRequest) {
  if (
    !request.nextUrl.pathname.startsWith("/admin") &&
    !request.nextUrl.pathname.startsWith("/api/admin")
  ) {
    return NextResponse.next();
  }
  if (request.nextUrl.pathname === "/admin/login") return NextResponse.next();

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
