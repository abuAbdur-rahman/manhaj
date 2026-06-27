import { createClient } from "@/lib/supabase/server";
import type { Episode, Scholar, Series } from "@/types";

export async function getRecentEpisodes(limit = 10): Promise<Episode[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("episodes")
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to fetch recent episodes:", error.message);
    return [];
  }

  return data as Episode[];
}

export async function getFeaturedSeries(): Promise<Series[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("series")
    .select("*, scholar:scholar_id(*), episode_count:episodes(count)")
    .eq("is_featured", true)
    .eq("is_active", true)
    .limit(1);

  if (error) {
    console.error("Failed to fetch featured series:", error.message);
    return [];
  }

  return data.map((item: Record<string, unknown>) => ({
    ...item,
    episode_count: item.episode_count
      ? ((item.episode_count as { count: number }[])[0]?.count ?? 0)
      : 0,
  })) as unknown as Series[];
}

export async function getScholars(limit = 3): Promise<Scholar[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scholars")
    .select("*, episode_count:episodes(count)")
    .eq("is_active", true)
    .order("name")
    .limit(limit);

  if (error) {
    console.error("Failed to fetch scholars:", error.message);
    return [];
  }

  return data.map((item: Record<string, unknown>) => ({
    ...item,
    episode_count: item.episode_count
      ? ((item.episode_count as { count: number }[])[0]?.count ?? 0)
      : 0,
  })) as unknown as Scholar[];
}

export async function getAllScholars(): Promise<Scholar[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scholars")
    .select("*, episode_count:episodes(count), series_count:series(count)")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("Failed to fetch scholars:", error.message);
    return [];
  }

  return data.map((item: Record<string, unknown>) => ({
    ...item,
    episode_count: item.episode_count
      ? ((item.episode_count as { count: number }[])[0]?.count ?? 0)
      : 0,
    series_count: item.series_count
      ? ((item.series_count as { count: number }[])[0]?.count ?? 0)
      : 0,
  })) as unknown as Scholar[];
}

export async function getScholarBySlug(slug: string): Promise<Scholar | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scholars")
    .select("*, episode_count:episodes(count), series_count:series(count)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Failed to fetch scholar:", error?.message);
    return null;
  }

  return {
    ...data,
    episode_count: data.episode_count
      ? ((data.episode_count as { count: number }[])[0]?.count ?? 0)
      : 0,
    series_count: data.series_count
      ? ((data.series_count as { count: number }[])[0]?.count ?? 0)
      : 0,
  } as unknown as Scholar;
}

export async function getScholarSeries(scholarId: string): Promise<Series[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("series")
    .select("*, scholar:scholar_id(*), episode_count:episodes(count)")
    .eq("scholar_id", scholarId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch scholar series:", error.message);
    return [];
  }

  return data.map((item: Record<string, unknown>) => ({
    ...item,
    episode_count: item.episode_count
      ? ((item.episode_count as { count: number }[])[0]?.count ?? 0)
      : 0,
  })) as unknown as Series[];
}

export async function getScholarEpisodes(
  scholarId: string,
): Promise<Episode[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("episodes")
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .eq("scholar_id", scholarId)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch scholar episodes:", error.message);
    return [];
  }

  return data as Episode[];
}

export async function getSeriesWithEpisodes(
  scholarSlug: string,
  seriesSlug: string,
): Promise<{ series: Series; episodes: Episode[] } | null> {
  const supabase = await createClient();

  const { data: scholar, error: scholarError } = await supabase
    .from("scholars")
    .select("id")
    .eq("slug", scholarSlug)
    .eq("is_active", true)
    .single();

  if (scholarError || !scholar) {
    console.error("Failed to fetch scholar for series:", scholarError?.message);
    return null;
  }

  const { data: seriesData, error: seriesError } = await supabase
    .from("series")
    .select("*, scholar:scholar_id(*), episode_count:episodes(count)")
    .eq("scholar_id", scholar.id)
    .eq("slug", seriesSlug)
    .eq("is_active", true)
    .single();

  if (seriesError || !seriesData) {
    console.error("Failed to fetch series:", seriesError?.message);
    return null;
  }

  const series = {
    ...seriesData,
    episode_count: seriesData.episode_count
      ? ((seriesData.episode_count as { count: number }[])[0]?.count ?? 0)
      : 0,
  } as unknown as Series;

  const { data: episodes, error: episodesError } = await supabase
    .from("episodes")
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .eq("series_id", series.id)
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (episodesError) {
    console.error("Failed to fetch episodes:", episodesError.message);
    return { series, episodes: [] };
  }

  return { series, episodes: episodes as Episode[] };
}
