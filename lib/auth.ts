import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "scholar_admin";

export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  scholarId: string | null;
}

export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    if (userError) console.error("getCurrentAdmin: auth error", userError);
    return null;
  }

  const { data: admin, error: adminError } = await supabase
    .from("admins")
    .select("id, name, email, role, scholar_id, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (adminError || !admin) {
    if (adminError && adminError.code !== "PGRST116") {
      console.error("getCurrentAdmin: admin query error", adminError);
    }
    return null;
  }
  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    scholarId: admin.scholar_id,
  };
});

export async function requireAdmin(
  requiredRole?: AdminRole,
): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (requiredRole && admin.role !== requiredRole) redirect("/admin");
  return admin;
}

export async function requireAdminApi(
  requiredRole?: AdminRole,
): Promise<CurrentAdmin | Response> {
  const admin = await getCurrentAdmin();
  if (!admin) {
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
  if (requiredRole && admin.role !== requiredRole) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "Insufficient permissions",
        },
      },
      { status: 403 },
    );
  }
  return admin;
}
