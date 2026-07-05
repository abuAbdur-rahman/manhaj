import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Episode, Language } from "@/types";

const MAX_QUERY_LENGTH = 100;
const DISALLOWED_CHARS = /[^\p{L}\p{N}\s'-]/gu;

function sanitizeQuery(raw: string): string {
  return raw.trim().slice(0, MAX_QUERY_LENGTH).replace(DISALLOWED_CHARS, "");
}

function escapeLike(val: string): string {
  return val.replace(/[%_]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";
  const langsParam = request.nextUrl.searchParams.get("langs") ?? "";
  const languages = langsParam
    ? (langsParam.split(",").filter(Boolean) as Language[])
    : [];

  const q = sanitizeQuery(query);
  if (!q) {
    return NextResponse.json({ data: [] });
  }

  const supabase = await createClient();

  const likePattern = `%${escapeLike(q)}%`;
  const words = q.split(/\s+/).filter(Boolean);

  const orParts: string[] = [`title.ilike.${likePattern}`];

  if (words.length > 0) {
    const tagArray = `{${words.map((w) => `"${w.toLowerCase()}"`).join(",")}}`;
    orParts.push(`tags.cs.${tagArray}`);
  }

  const [scholarResult, seriesResult] = await Promise.all([
    supabase
      .from("scholars")
      .select("id")
      .eq("is_active", true)
      .or(`name.ilike.${likePattern}`),
    supabase
      .from("series")
      .select("id")
      .eq("is_active", true)
      .or(`title.ilike.${likePattern}`),
  ]);

  const scholarIds = scholarResult.data?.map((s) => s.id) ?? [];
  const seriesIds = seriesResult.data?.map((s) => s.id) ?? [];

  if (scholarIds.length > 0) {
    orParts.push(`scholar_id.in.(${scholarIds.join(",")})`);
  }
  if (seriesIds.length > 0) {
    orParts.push(`series_id.in.(${seriesIds.join(",")})`);
  }

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
    return NextResponse.json(
      { error: { code: "SEARCH_ERROR", message: "Search failed" } },
      { status: 500 },
    );
  }

  return NextResponse.json({ data: data as Episode[] });
}
