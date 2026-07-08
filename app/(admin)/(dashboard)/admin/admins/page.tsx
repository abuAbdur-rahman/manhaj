import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Admin } from "@/types";
import { AdminsList } from "./admins-list";

const PAGE_SIZE = 20;

export default async function AdminAdminsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  await requireAdmin("super_admin");

  const supabase = await createClient();

  const [adminsResult, countResult, scholarsResult] = await Promise.all([
    supabase
      .from("admins")
      .select("*, scholar:scholar_id(id, name)")
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase.from("admins").select("id", { count: "exact", head: true }),
    supabase
      .from("scholars")
      .select("id, name")
      .eq("is_active", true)
      .order("name", { ascending: true }),
  ]);

  if (adminsResult.error) throw adminsResult.error;
  if (countResult.error) throw countResult.error;
  if (scholarsResult.error) throw scholarsResult.error;

  return (
    <AdminsList
      admins={(adminsResult.data as unknown as Admin[]) ?? []}
      scholars={scholarsResult.data ?? []}
      pagination={{
        page,
        pageSize: PAGE_SIZE,
        totalCount: countResult.count ?? 0,
      }}
    />
  );
}
