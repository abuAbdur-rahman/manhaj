import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Scholar } from "@/types";
import { ScholarsList } from "./scholars-list";

export default async function AdminScholarsPage() {
  const admin = await requireAdmin();

  if (admin.role !== "super_admin") {
    redirect("/admin");
  }

  const supabase = await createClient();

  const { data: scholars, error } = await supabase
    .from("scholars")
    .select("*")
    .order("name");

  if (error) throw error;

  return <ScholarsList scholars={(scholars as Scholar[]) ?? []} />;
}
