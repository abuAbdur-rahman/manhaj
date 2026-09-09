import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Scholar } from "@/types";
import { ScholarsList } from "./scholars-list";

const PAGE_SIZE = 20;

export default async function AdminScholarsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = await requireAdmin();

  if (admin.role !== "super_admin") {
    redirect("/admin");
  }

  const supabase = await createClient();

  const [scholarsResult, countResult] = await Promise.all([
    supabase.from("scholars").select("*").order("name").range(from, to),
    supabase.from("scholars").select("id", { count: "exact", head: true }),
  ]);

  if (scholarsResult.error) throw scholarsResult.error;
  if (countResult.error) throw countResult.error;

  return (
    <ScholarsList
      scholars={(scholarsResult.data as Scholar[]) ?? []}
      pagination={{
        page,
        pageSize: PAGE_SIZE,
        totalCount: countResult.count ?? 0,
      }}
    />
  );
}
