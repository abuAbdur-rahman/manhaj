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

const PAGE_SIZE = 20;

function mapSeriesWithCount(data: Record<string, unknown>[]): SeriesWithCount[] {
  return data.map((s) => ({
    ...s,
    episode_count:
      (s as unknown as { episode_count: { count: number }[] })
        .episode_count?.[0]?.count ?? 0,
  })) as SeriesWithCount[];
}

export default async function AdminSeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = await requireAdmin();

  if (admin.role === "scholar_admin" && !admin.scholarId) {
    throw new Error("Scholar admin is missing scholar scope");
  }

  const supabase = await createClient();

  let scholars: ScholarOption[];
  let series: SeriesWithCount[];
  let totalCount = 0;

  if (admin.role === "scholar_admin") {
    const [seriesResult, countResult] = await Promise.all([
      supabase
        .from("series")
        .select(
          `*,
          scholar:scholar_id(id, name),
          episode_count:episodes(count)`,
        )
        .eq("scholar_id", admin.scholarId)
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase
        .from("series")
        .select("id", { count: "exact", head: true })
        .eq("scholar_id", admin.scholarId),
    ]);

    if (seriesResult.error) throw seriesResult.error;
    if (countResult.error) throw countResult.error;
    series = mapSeriesWithCount(seriesResult.data ?? []);
    totalCount = countResult.count ?? 0;
    scholars = [];
  } else {
    const [seriesResult, countResult, scholarsResult] = await Promise.all([
      supabase
        .from("series")
        .select(
          `*,
          scholar:scholar_id(id, name),
          episode_count:episodes(count)`,
        )
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase.from("series").select("id", { count: "exact", head: true }),
      supabase
        .from("scholars")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
    ]);

    if (seriesResult.error) throw seriesResult.error;
    if (countResult.error) throw countResult.error;
    if (scholarsResult.error) throw scholarsResult.error;

    series = mapSeriesWithCount(seriesResult.data ?? []);
    totalCount = countResult.count ?? 0;
    scholars = scholarsResult.data ?? [];
  }

  return (
    <SeriesList
      series={series}
      scholars={scholars}
      adminRole={admin.role}
      adminScholarId={admin.scholarId}
      pagination={{
        page,
        pageSize: PAGE_SIZE,
        totalCount,
      }}
    />
  );
}
