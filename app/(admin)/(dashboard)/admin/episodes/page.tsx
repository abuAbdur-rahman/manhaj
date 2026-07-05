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

export default async function AdminEpisodesPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  let episodes: Episode[];
  let scholars: ScholarOption[];
  let series: SeriesOption[];

  if (admin.role === "scholar_admin") {
    const [epResult, seriesResult] = await Promise.all([
      supabase
        .from("episodes")
        .select("*, scholar:scholar_id(*), series:series_id(*)")
        .eq("scholar_id", admin.scholarId)
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("series")
        .select("id, title, scholar_id, scholar:scholar_id(name)")
        .eq("scholar_id", admin.scholarId)
        .eq("is_active", true)
        .order("title")
        .limit(100),
    ]);

    if (epResult.error) throw epResult.error;
    if (seriesResult.error) throw seriesResult.error;
    episodes = epResult.data ?? [];
    scholars = [];
    series = (seriesResult.data ?? []) as unknown as SeriesOption[];
  } else {
    const [epResult, scholarsResult, seriesResult] = await Promise.all([
      supabase
        .from("episodes")
        .select("*, scholar:scholar_id(*), series:series_id(*)")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("scholars")
        .select("id, name")
        .eq("is_active", true)
        .order("name")
        .limit(100),
      supabase
        .from("series")
        .select("id, title, scholar_id, scholar:scholar_id(name)")
        .eq("is_active", true)
        .order("title")
        .limit(100),
    ]);

    if (epResult.error) throw epResult.error;
    if (scholarsResult.error) throw scholarsResult.error;
    if (seriesResult.error) throw seriesResult.error;

    episodes = epResult.data ?? [];
    scholars = scholarsResult.data ?? [];
    series = (seriesResult.data ?? []) as unknown as SeriesOption[];
  }

  return (
    <EpisodesList
      episodes={episodes}
      scholars={scholars}
      series={series}
      adminRole={admin.role}
    />
  );
}
