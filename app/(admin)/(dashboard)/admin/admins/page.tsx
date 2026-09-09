import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Admin } from "@/types";
import { AdminsList } from "./admins-list";

export default async function AdminAdminsPage() {
  await requireAdmin("super_admin");

  const supabase = await createClient();

  const { data: admins, error } = await supabase
    .from("admins")
    .select("*, scholar:scholar_id(id, name)")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return <AdminsList admins={(admins as unknown as Admin[]) ?? []} />;
}
