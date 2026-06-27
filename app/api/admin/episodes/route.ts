import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const CreateEpisodeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  series_id: z.string().min(1, "Series is required"),
  language: z.enum(["yoruba", "english", "arabic"]),
  tags: z.array(z.enum([
    "aqeedah", "fiqh", "tafseer", "hadith", "seerah",
    "manhaj", "adab", "family", "ibadah", "dawah", "ruqyah", "arabic",
  ])).default([]),
  audio_url: z.string().min(1, "Audio URL is required"),
  duration_seconds: z.number().int().positive().optional(),
  recorded_date: z.string().optional(),
  description: z.string().optional(),
  is_published: z.boolean().default(false),
});

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(request: NextRequest) {
  const authResult = await requireAdminApi();
  if (authResult instanceof Response) return authResult;
  const admin = authResult;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Malformed JSON" } },
      { status: 400 },
    );
  }
  const result = CreateEpisodeSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: result.error.flatten().fieldErrors,
        },
      },
      { status: 422 },
    );
  }

  const {
    title,
    series_id,
    language,
    tags,
    audio_url,
    duration_seconds,
    recorded_date,
    description,
    is_published,
  } = result.data;

  const supabase = await createClient();

  const { data: series, error: seriesError } = await supabase
    .from("series")
    .select("scholar_id")
    .eq("id", series_id)
    .single();

  if (seriesError || !series) {
    return NextResponse.json(
      {
        error: { code: "NOT_FOUND", message: "Series not found" },
      },
      { status: 404 },
    );
  }

  if (
    admin.role === "scholar_admin" &&
    series.scholar_id !== admin.scholarId
  ) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You can only create episodes for your assigned scholar",
        },
      },
      { status: 403 },
    );
  }

  const baseSlug = slugify(title);
  const uniqueSlug = baseSlug
    ? `${baseSlug}-${Date.now().toString(36)}`
    : `episode-${Date.now().toString(36)}`;

  const { data: episode, error: insertError } = await supabase
    .from("episodes")
    .insert({
      title,
      series_id,
      scholar_id: series.scholar_id,
      slug: uniqueSlug,
      language,
      tags,
      audio_url,
      duration_seconds: duration_seconds ?? null,
      recorded_date: recorded_date ?? null,
      description: description ?? null,
      is_published,
    })
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .single();

  if (insertError) {
    console.error("Error creating episode:", insertError);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create episode",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(episode, { status: 201 });
}
