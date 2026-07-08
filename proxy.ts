import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { requireEnv } from "@/lib/utils";

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/accept-invite"];

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPath =
    path.startsWith("/admin") || path.startsWith("/api/admin");
  if (!isAdminPath) return NextResponse.next();
  if (PUBLIC_ADMIN_PATHS.includes(path)) return NextResponse.next();

  const isApiPath = path.startsWith("/api/admin");
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";

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
    if (isApiPath) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Invalid or expired session",
          },
        },
        { status: 401 },
      );
    }
    return NextResponse.redirect(loginUrl);
  }

  const { data: adminRow } = await supabase
    .from("admins")
    .select("is_active")
    .eq("id", user.id)
    .single();

  if (!adminRow?.is_active) {
    await supabase.auth.signOut();
    if (isApiPath) {
      return NextResponse.json(
        { error: { code: "FORBIDDEN", message: "Account deactivated" } },
        { status: 403 },
      );
    }
    loginUrl.search = "";
    loginUrl.searchParams.set("error", "deactivated");
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
