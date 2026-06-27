import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UpdateSeriesSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  cover_url: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
  scholar_id: z.string().uuid().optional(),
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
    .from("series")
    .select("id, scholar_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Series not found" } },
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
          message: "You can only edit series for your assigned scholar",
        },
      },
      { status: 403 },
    );
  }

  const body = await request.json();
  const result = UpdateSeriesSchema.safeParse(body);
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

  const updates = { ...result.data };

  if (updates.scholar_id && admin.role === "super_admin") {
    const { data: scholarExists } = await supabase
      .from("scholars")
      .select("id")
      .eq("id", updates.scholar_id)
      .eq("is_active", true)
      .single();
    if (!scholarExists) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Scholar not found" } },
        { status: 404 },
      );
    }
  } else {
    delete updates.scholar_id;
  }

  const { data: updated, error: updateError } = await supabase
    .from("series")
    .update(result.data)
    .eq("id", id)
    .select("*, scholar:scholar_id(*)")
    .single();

  if (updateError) {
    console.error("Error updating series:", updateError);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to update series" },
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
    .from("series")
    .select("id, scholar_id")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Series not found" } },
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
          message: "You can only delete series for your assigned scholar",
        },
      },
      { status: 403 },
    );
  }

  const { error: updateError } = await supabase
    .from("series")
    .update({ is_active: false })
    .eq("id", id);

  if (updateError) {
    console.error("Error deactivating series:", updateError);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to deactivate series",
        },
      },
      { status: 500 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
