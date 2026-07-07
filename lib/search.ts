import type { Episode, Language } from "@/types";

interface SearchEpisodesOptions {
  page?: number;
  pageSize?: number;
}

interface SearchEpisodesResult {
  data: Episode[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function searchEpisodes(
  query: string,
  languages: Language[] = [],
  options: SearchEpisodesOptions = {},
): Promise<SearchEpisodesResult> {
  const params = new URLSearchParams();
  params.set("q", query);
  params.set("page", String(options.page ?? 1));
  params.set("pageSize", String(options.pageSize ?? 20));
  if (languages.length > 0) {
    params.set("langs", languages.join(","));
  }

  const res = await fetch(`/api/search?${params.toString()}`);
  if (!res.ok) throw new Error("Search failed");

  const json = await res.json();
  return json as SearchEpisodesResult;
}
