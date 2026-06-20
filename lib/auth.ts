import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type AdminRole = "super_admin" | "scholar_admin";

export interface CurrentAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  scholarId: string | null;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
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
}

export async function requireAdmin(
  requiredRole?: AdminRole,
): Promise<CurrentAdmin> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  if (requiredRole && admin.role !== requiredRole) redirect("/admin");
  return admin;
}
