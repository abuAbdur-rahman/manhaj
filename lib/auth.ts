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
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: admin } = await supabase
    .from("admins")
    .select("id, name, email, role, scholar_id, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .single();

  if (!admin) return null;
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
