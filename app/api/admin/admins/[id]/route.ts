import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const UpdateAdminSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["super_admin", "scholar_admin"]).optional(),
  scholar_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAdminApi();
  if (authResult instanceof Response) return authResult;
  const admin = authResult;

  if (admin.role !== "super_admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super admin role required" } },
      { status: 403 },
    );
  }

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot update yourself through this endpoint",
        },
      },
      { status: 422 },
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

  const result = UpdateAdminSchema.safeParse(body);
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

  if (updates.role === "super_admin") {
    updates.scholar_id = null;
  }

  if (updates.role === "scholar_admin" && !updates.scholar_id) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "scholar_id is required for scholar_admin role",
        },
      },
      { status: 422 },
    );
  }

  const supabase = await createClient();

  const { data: updated, error: updateError } = await supabase
    .from("admins")
    .update(updates)
    .eq("id", id)
    .select("*, scholar:scholar_id(id, name)")
    .maybeSingle();

  if (updateError) {
    console.error("Error updating admin:", updateError);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to update admin" },
      },
      { status: 500 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Admin not found" } },
      { status: 404 },
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

  if (admin.role !== "super_admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super admin role required" } },
      { status: 403 },
    );
  }

  const { id } = await params;

  if (id === admin.id) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot deactivate yourself",
        },
      },
      { status: 422 },
    );
  }

  const supabase = await createClient();

  const { data: deactivated, error: deleteError } = await supabase
    .from("admins")
    .update({ is_active: false })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("Error deactivating admin:", deleteError);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to deactivate admin",
        },
      },
      { status: 500 },
    );
  }

  if (!deactivated) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Admin not found" } },
      { status: 404 },
    );
  }

  await createAdminClient().auth.admin.signOut(id, "global");

  return new NextResponse(null, { status: 204 });
}
