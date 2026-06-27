import { createClient } from "@/lib/supabase/client";
import type { Episode, Language } from "@/types";

const MAX_QUERY_LENGTH = 100;
const DISALLOWED_CHARS = /[^a-zA-Z0-9\s'-]/g;

function sanitizeQuery(raw: string): string {
  return raw.trim().slice(0, MAX_QUERY_LENGTH).replace(DISALLOWED_CHARS, "");
}

export async function searchEpisodes(
  query: string,
  languages: Language[] = [],
): Promise<Episode[]> {
  const q = sanitizeQuery(query);
  if (!q) return [];

  const supabase = createClient();

  const lower = q.toLowerCase();
  const orParts = [
    `title.ilike.%${q}%`,
    `tags.cs.{${lower}}`,
    `scholar_id.name.ilike.%${q}%`,
    `series_id.title.ilike.%${q}%`,
  ];

  let chain = supabase
    .from("episodes")
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .eq("is_published", true)
    .or(orParts.join(","));

  if (languages.length > 0) {
    chain = chain.in("language", languages);
  }

  const { data, error } = await chain
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Search failed:", error.message);
    throw error;
  }

  return (data ?? []) as Episode[];
}
