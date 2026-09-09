import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  claimOperation,
  completeOperation,
  failOperation,
  getOperationId,
  requestHash,
} from "@/lib/admin-operations";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const UpdateEpisodeSchema = z.object({
  title: z.string().min(1).max(200, "Title is too long").optional(),
  series_id: z.string().uuid().optional(),
  language: z.enum(["yoruba", "english", "arabic"]).optional(),
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
    .optional(),
  description: z.string().max(10_000).optional(),
  recorded_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Recorded date must be YYYY-MM-DD")
    .optional(),
  is_published: z.boolean().optional(),
  upload_operation_id: z.string().uuid().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof Response) return authResult;
  const admin = authResult;
  const operationId = getOperationId(request);
  if (operationId instanceof Response) return operationId;

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from("episodes")
    .select("id, scholar_id, series_id, title, slug, audio_url")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Episode not found" } },
      { status: 404 },
    );
  }

  if (
    admin.role === "scholar_admin" &&
    existing.scholar_id !== admin.scholarId
  ) {
    return NextResponse.json(
      {
        error: {
          code: "FORBIDDEN",
          message: "You can only edit episodes for your assigned scholar",
        },
      },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Malformed JSON" } },
      { status: 400 },
    );
  }
  const result = UpdateEpisodeSchema.safeParse(body);
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

  if (result.data.series_id) {
    const { data: targetSeries } = await supabase
      .from("series")
      .select("scholar_id")
      .eq("id", result.data.series_id)
      .single();

    if (!targetSeries) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Target series not found" } },
        { status: 404 },
      );
    }

    if (targetSeries.scholar_id !== existing.scholar_id) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Series must belong to the same scholar as the episode",
          },
        },
        { status: 422 },
      );
    }
  }

  const updatePayload: Record<string, unknown> = { ...result.data };
  delete updatePayload.upload_operation_id;

  if (result.data.upload_operation_id) {
    const { data: upload } = await supabase
      .from("episode_operations")
      .select("admin_id, scholar_id, status, object_url")
      .eq("id", result.data.upload_operation_id)
      .eq("operation_type", "upload")
      .maybeSingle();
    if (
      !upload ||
      upload.admin_id !== admin.id ||
      upload.scholar_id !== existing.scholar_id ||
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
    updatePayload.audio_url = upload.object_url;
  }

  const effectiveAudioUrl =
    existing.audio_url ??
    (updatePayload.audio_url as string | undefined) ??
    null;

  if (result.data.is_published === true && !effectiveAudioUrl) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Audio is required before publishing",
        },
      },
      { status: 422 },
    );
  }

  const fingerprint = requestHash({ episodeId: id, ...result.data });
  const claim = await claimOperation(supabase, {
    id: operationId,
    adminId: admin.id,
    scholarId: existing.scholar_id,
    operationType: "update_episode",
    requestHash: fingerprint,
    resourceId: id,
  });
  if (claim instanceof Response) return claim;
  if (claim.status === "completed") {
    const { data: replay } = await supabase
      .from("episodes")
      .select("*, scholar:scholar_id(*), series:series_id(*)")
      .eq("id", id)
      .single();
    return NextResponse.json(replay);
  }

  const { data: updated, error: updateError } = await supabase
    .from("episodes")
    .update(updatePayload)
    .eq("id", id)
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .single();

  if (updateError) {
    console.error("Error updating episode:", updateError);
    await failOperation(supabase, {
      id: operationId,
      adminId: admin.id,
      claimToken: claim.claim_token,
    }).catch((failure) =>
      console.error("Failed to release update operation:", failure),
    );
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to update episode" },
      },
      { status: 500 },
    );
  }

  try {
    await completeOperation(supabase, {
      id: operationId,
      adminId: admin.id,
      claimToken: claim.claim_token,
      resourceId: id,
      responseBody: updated,
    });
  } catch (error) {
    console.error("Failed to complete update operation:", error);
    await failOperation(supabase, {
      id: operationId,
      adminId: admin.id,
      claimToken: claim.claim_token,
    }).catch((failure) =>
      console.error("Failed to release update operation for retry:", failure),
    );
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message:
            "Episode updated but operation was not completed; retry with the same operation ID",
        },
      },
      { status: 500 },
    );
  }
  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof Response) return authResult;
  const admin = authResult;

  const { id } = await params;
  const supabase = createAdminClient();

  let query = supabase.from("episodes").delete().eq("id", id);
  if (admin.role === "scholar_admin" && admin.scholarId) {
    query = query.eq("scholar_id", admin.scholarId);
  }

  const { error: deleteError } = await query;

  if (deleteError) {
    console.error("Error deleting episode:", deleteError);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to delete episode" },
      },
      { status: 500 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
