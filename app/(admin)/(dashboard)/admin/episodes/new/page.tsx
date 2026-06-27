import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewEpisodeForm } from "./new-episode-form";

interface AdminSeries {
  id: string;
  title: string;
  scholar?: { name: string } | null;
}

export default async function NewEpisodePage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  let series: AdminSeries[];
  if (admin.role === "scholar_admin") {
    const { data, error } = await supabase
      .from("series")
      .select("id, title")
      .eq("scholar_id", admin.scholarId)
      .eq("is_active", true)
      .order("title");
    if (error) throw error;
    series = (data ?? []) as AdminSeries[];
  } else {
    const { data, error } = await supabase
      .from("series")
      .select("id, title, scholar:scholar_id(name)")
      .eq("is_active", true)
      .order("title");
    if (error) throw error;
    const raw = data as unknown as { id: string; title: string; scholar: { name: string } | null }[];
    series = raw.map((s) => ({ id: s.id, title: s.title, scholar: s.scholar }));
  }

  return <NewEpisodeForm series={series} adminRole={admin.role} />;
}
