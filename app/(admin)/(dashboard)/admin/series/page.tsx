import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SeriesList } from "./series-list";

interface ScholarOption {
  id: string;
  name: string;
}

interface SeriesWithCount {
  id: string;
  scholar_id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  scholar: ScholarOption | null;
  episode_count: number;
}

export default async function AdminSeriesPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  let scholars: ScholarOption[];
  let series: SeriesWithCount[];

  if (admin.role === "scholar_admin") {
    const [seriesResult] = await Promise.all([
      supabase
        .from("series")
        .select(
          `*,
          scholar:scholar_id(id, name),
          episode_count:episodes(count)`,
        )
        .eq("scholar_id", admin.scholarId)
        .order("created_at", { ascending: false }),
    ]);

    if (seriesResult.error) throw seriesResult.error;
    series = (seriesResult.data ?? []).map((s) => ({
      ...s,
      episode_count: (s as unknown as { episode_count: { count: number }[] }).episode_count?.[0]?.count ?? 0,
    })) as SeriesWithCount[];
    scholars = [];
  } else {
    const [seriesResult, scholarsResult] = await Promise.all([
      supabase
        .from("series")
        .select(
          `*,
          scholar:scholar_id(id, name),
          episode_count:episodes(count)`,
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("scholars")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

    if (seriesResult.error) throw seriesResult.error;
    if (scholarsResult.error) throw scholarsResult.error;

    series = (seriesResult.data ?? []).map((s) => ({
      ...s,
      episode_count: (s as unknown as { episode_count: { count: number }[] }).episode_count?.[0]?.count ?? 0,
    })) as SeriesWithCount[];
    scholars = scholarsResult.data ?? [];
  }

  return (
    <SeriesList
      series={series}
      scholars={scholars}
      adminRole={admin.role}
      adminScholarId={admin.scholarId}
    />
  );
}
