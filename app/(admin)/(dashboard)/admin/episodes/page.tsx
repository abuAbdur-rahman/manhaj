import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Episode } from "@/types";
import { EpisodesList } from "./episodes-list";

interface ScholarOption {
  id: string;
  name: string;
}

interface SeriesOption {
  id: string;
  title: string;
  scholar_id: string;
  scholar: { name: string } | null;
}

const PAGE_SIZE = 20;

export default async function AdminEpisodesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const admin = await requireAdmin();
  const supabase = await createClient();

  let episodes: Episode[];
  let scholars: ScholarOption[];
  let series: SeriesOption[];
  let totalCount = 0;

  if (admin.role === "scholar_admin") {
    const [epResult, countResult, seriesResult] = await Promise.all([
      supabase
        .from("episodes")
        .select("*, scholar:scholar_id(*), series:series_id(*)")
        .eq("scholar_id", admin.scholarId)
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase
        .from("episodes")
        .select("id", { count: "exact", head: true })
        .eq("scholar_id", admin.scholarId),
      supabase
        .from("series")
        .select("id, title, scholar_id, scholar:scholar_id(name)")
        .eq("scholar_id", admin.scholarId)
        .eq("is_active", true)
        .order("title"),
    ]);

    if (epResult.error) throw epResult.error;
    if (countResult.error) throw countResult.error;
    if (seriesResult.error) throw seriesResult.error;
    episodes = epResult.data ?? [];
    totalCount = countResult.count ?? 0;
    scholars = [];
    series = (seriesResult.data ?? []) as unknown as SeriesOption[];
  } else {
    const [epResult, countResult, scholarsResult, seriesResult] =
      await Promise.all([
        supabase
          .from("episodes")
          .select("*, scholar:scholar_id(*), series:series_id(*)")
          .order("created_at", { ascending: false })
          .range(from, to),
        supabase.from("episodes").select("id", { count: "exact", head: true }),
        supabase
          .from("scholars")
          .select("id, name")
          .eq("is_active", true)
          .order("name"),
        supabase
          .from("series")
          .select("id, title, scholar_id, scholar:scholar_id(name)")
          .eq("is_active", true)
          .order("title"),
      ]);

    if (epResult.error) throw epResult.error;
    if (countResult.error) throw countResult.error;
    if (scholarsResult.error) throw scholarsResult.error;
    if (seriesResult.error) throw seriesResult.error;

    episodes = epResult.data ?? [];
    totalCount = countResult.count ?? 0;
    scholars = scholarsResult.data ?? [];
    series = (seriesResult.data ?? []) as unknown as SeriesOption[];
  }

  return (
    <EpisodesList
      episodes={episodes}
      scholars={scholars}
      series={series}
      adminRole={admin.role}
      pagination={{
        page,
        pageSize: PAGE_SIZE,
        totalCount,
      }}
    />
  );
}
