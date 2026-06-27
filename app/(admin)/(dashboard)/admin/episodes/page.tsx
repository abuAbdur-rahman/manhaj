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
  scholar: { name: string } | null;
}

export default async function AdminEpisodesPage() {
  const admin = await requireAdmin();
  const supabase = await createClient();

  let episodes: Episode[];
  let scholars: ScholarOption[];
  let series: SeriesOption[];

  if (admin.role === "scholar_admin") {
    const epQuery = supabase
      .from("episodes")
      .select("*, scholar:scholar_id(*), series:series_id(*)")
      .eq("scholar_id", admin.scholarId)
      .order("created_at", { ascending: false });

    const [epResult] = await Promise.all([epQuery]);
    if (epResult.error) throw epResult.error;
    episodes = epResult.data ?? [];
    scholars = [];
    series = [];
  } else {
    const [epResult, scholarsResult, seriesResult] = await Promise.all([
      supabase
        .from("episodes")
        .select("*, scholar:scholar_id(*), series:series_id(*)")
        .order("created_at", { ascending: false }),
      supabase
        .from("scholars")
        .select("id, name")
        .eq("is_active", true)
        .order("name"),
      supabase
        .from("series")
        .select("id, title, scholar:scholar_id(name)")
        .eq("is_active", true)
        .order("title"),
    ]);

    if (epResult.error) throw epResult.error;
    if (scholarsResult.error) throw scholarsResult.error;
    if (seriesResult.error) throw seriesResult.error;

    episodes = epResult.data ?? [];
    scholars = scholarsResult.data ?? [];
    series = (seriesResult.data ?? []) as unknown as {
      id: string;
      title: string;
      scholar: { name: string } | null;
    }[];
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
