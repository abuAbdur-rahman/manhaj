import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const CreateEpisodeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  series_id: z.string().optional(),
  scholar_id: z.string().uuid().optional(),
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
    scholar_id: bodyScholarId,
    language,
    tags,
    audio_url,
    duration_seconds,
    recorded_date,
    description,
    is_published,
  } = result.data;

  const supabase = await createClient();

  let resolvedScholarId: string;

  if (admin.role === "super_admin") {
    if (!bodyScholarId) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Scholar is required",
          },
        },
        { status: 422 },
      );
    }
    resolvedScholarId = bodyScholarId;

    if (series_id) {
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

      if (series.scholar_id !== resolvedScholarId) {
        return NextResponse.json(
          {
            error: {
              code: "VALIDATION_ERROR",
              message: "Series does not belong to the selected scholar",
            },
          },
          { status: 422 },
        );
      }
    }
  } else {
    if (!admin.scholarId) {
      return NextResponse.json(
        {
          error: { code: "FORBIDDEN", message: "No scholar assigned" },
        },
        { status: 403 },
      );
    }
    resolvedScholarId = admin.scholarId;

    if (series_id) {
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

      if (series.scholar_id !== resolvedScholarId) {
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
    }
  }

  const baseSlug = slugify(title);
  const uniqueSlug = baseSlug
    ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
    : `episode-${crypto.randomUUID().slice(0, 8)}`;

  const { data: episode, error: insertError } = await supabase
    .from("episodes")
    .insert({
      title,
      series_id: series_id ?? null,
      scholar_id: resolvedScholarId,
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
