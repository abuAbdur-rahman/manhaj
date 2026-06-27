import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UpdateEpisodeSchema = z.object({
  title: z.string().min(1).optional(),
  series_id: z.string().min(1).optional(),
  language: z.enum(["yoruba", "english", "arabic"]).optional(),
  tags: z.array(z.string()).optional(),
  description: z.string().optional(),
  is_published: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof Response) return authResult;
  const admin = authResult;

  const { id } = await params;
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("episodes")
    .select("id, scholar_id, series_id, title, slug")
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

  const body = await request.json();
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

  const { data: updated, error: updateError } = await supabase
    .from("episodes")
    .update(result.data)
    .eq("id", id)
    .select("*, scholar:scholar_id(*), series:series_id(*)")
    .single();

  if (updateError) {
    console.error("Error updating episode:", updateError);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to update episode" },
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
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("episodes")
    .select("id, scholar_id")
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
          message: "You can only delete episodes for your assigned scholar",
        },
      },
      { status: 403 },
    );
  }

  const { error: deleteError } = await supabase
    .from("episodes")
    .delete()
    .eq("id", id);

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
