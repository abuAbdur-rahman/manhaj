import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewEpisodeForm } from "./new-episode-form";

interface AdminSeries {
  id: string;
  title: string;
  scholar_id: string;
  scholar?: { name: string } | null;
}

interface AdminScholar {
  id: string;
  name: string;
}

export default async function NewEpisodePage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  let series: AdminSeries[];
  let scholars: AdminScholar[] = [];

  if (admin.role === "scholar_admin") {
    const { data, error } = await supabase
      .from("series")
      .select("id, title, scholar_id")
      .eq("scholar_id", admin.scholarId)
      .eq("is_active", true)
      .order("title");
    if (error) throw error;
    series = (data ?? []) as AdminSeries[];
  } else {
    const [seriesResult, scholarsResult] = await Promise.all([
      supabase
        .from("series")
        .select("id, title, scholar_id, scholar:scholar_id(name)")
        .eq("is_active", true)
        .order("title"),
      supabase
        .from("scholars")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

    if (seriesResult.error) throw seriesResult.error;
    if (scholarsResult.error) throw scholarsResult.error;

    const raw = seriesResult.data as unknown as {
      id: string;
      title: string;
      scholar_id: string;
      scholar: { name: string } | null;
    }[];
    series = raw.map((s) => ({
      id: s.id,
      title: s.title,
      scholar_id: s.scholar_id,
      scholar: s.scholar,
    }));

    scholars = (scholarsResult.data ?? []) as AdminScholar[];
  }

  return (
    <NewEpisodeForm
      series={series}
      scholars={scholars}
      adminRole={admin.role}
      adminScholarId={admin.scholarId ?? null}
    />
  );
}
