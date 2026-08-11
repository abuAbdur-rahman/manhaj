import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  claimOperation,
  failOperation,
  getOperationId,
  requestHash,
} from "@/lib/admin-operations";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const CreateEpisodeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title is too long"),
  series_id: z.string().uuid().optional(),
  scholar_id: z.string().uuid().optional(),
  language: z.enum(["yoruba", "english", "arabic"]),
  tags: z
    .array(
      z.enum([
        "aqeedah",
        "fiqh",
        "tafseer",
        "hadith",
        "seerah",
        "manhaj",
        "adab",
        "family",
        "ibadah",
        "dawah",
        "ruqyah",
        "arabic",
      ]),
    )
    .max(12)
    .default([]),
  upload_operation_id: z.string().uuid().nullable().optional(),
  duration_seconds: z
    .number()
    .int()
    .positive()
    .max(86_400 * 24)
    .optional(),
  recorded_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Recorded date must be YYYY-MM-DD")
    .optional(),
  description: z.string().max(10_000).optional(),
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
  const operationId = getOperationId(request);
  if (operationId instanceof Response) return operationId;
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
    upload_operation_id,
    duration_seconds,
    recorded_date,
    description,
    is_published,
  } = result.data;

  const supabase = createAdminClient();

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

  if (is_published && !upload_operation_id) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "A completed audio upload is required to publish",
        },
      },
      { status: 422 },
    );
  }

  let trustedAudioUrl: string | null = null;
  if (upload_operation_id) {
    const { data: upload } = await supabase
      .from("episode_operations")
      .select("admin_id, scholar_id, status, object_url")
      .eq("id", upload_operation_id)
      .eq("operation_type", "upload")
      .maybeSingle();
    if (
      !upload ||
      upload.admin_id !== admin.id ||
      upload.scholar_id !== resolvedScholarId ||
      upload.status !== "completed" ||
      !upload.object_url
    ) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message:
              "Audio upload does not belong to this administrator and scholar",
          },
        },
        { status: 422 },
      );
    }
    trustedAudioUrl = upload.object_url;
  }

  const fingerprint = requestHash(result.data);
  const claim = await claimOperation(supabase, {
    id: operationId,
    adminId: admin.id,
    scholarId: resolvedScholarId,
    operationType: "create_episode",
    requestHash: fingerprint,
  });
  if (claim instanceof Response) return claim;
  if (claim.status === "completed" && claim.resource_id) {
    const { data: replay } = await supabase
      .from("episodes")
      .select("*, scholar:scholar_id(*), series:series_id(*)")
      .eq("id", claim.resource_id)
      .single();
    return NextResponse.json(replay);
  }

  const baseSlug = slugify(title);
  const uniqueSlug = baseSlug
    ? `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`
    : `episode-${crypto.randomUUID().slice(0, 8)}`;

  const { data: created, error: createError } = await supabase.rpc(
    "create_episode_with_operation",
    {
      p_operation_id: operationId,
      p_admin_id: admin.id,
      p_claim_token: claim.claim_token,
      p_title: title,
      p_series_id: series_id ?? null,
      p_scholar_id: resolvedScholarId,
      p_slug: uniqueSlug,
      p_language: language,
      p_tags: tags,
      p_audio_url: trustedAudioUrl,
      p_duration_seconds: duration_seconds ?? null,
      p_recorded_date: recorded_date ?? null,
      p_description: description ?? null,
      p_is_published: is_published,
    },
  );

  if (createError || !created) {
    console.error("Error creating episode:", createError);
    await failOperation(supabase, {
      id: operationId,
      adminId: admin.id,
      claimToken: claim.claim_token,
    }).catch((failure) =>
      console.error("Failed to release create operation:", failure),
    );
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

  const { data: episode, error: fetchCreatedError } = await supabase
    .from("episodes")
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .eq("id", operationId)
    .single();
  if (fetchCreatedError || !episode) {
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Episode created but could not be loaded",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(episode, { status: 201 });
}
