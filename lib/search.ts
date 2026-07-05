import type { Episode, Language } from "@/types";

export async function searchEpisodes(
  query: string,
  languages: Language[] = [],
): Promise<Episode[]> {
  const params = new URLSearchParams();
  params.set("q", query);
  if (languages.length > 0) {
    params.set("langs", languages.join(","));
  }

  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");

  const json = await res.json();
  return json.data as Episode[];
}
