import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const UpdateScholarSchema = z.object({
  name: z.string().min(1).optional(),
  bio: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  languages: z.array(z.enum(["yoruba", "english", "arabic"])).optional(),
  social_links: z
    .object({
      youtube: z.string().optional(),
      telegram: z.string().optional(),
      whatsapp: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Malformed JSON" } },
      { status: 400 },
    );
  }
  const result = UpdateScholarSchema.safeParse(body);
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

  const supabase = await createClient();

  const { data: updated, error: updateError } = await supabase
    .from("scholars")
    .update(result.data)
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (updateError) {
    console.error("Error updating scholar:", updateError);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to update scholar" },
      },
      { status: 500 },
    );
  }

  if (!updated) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Scholar not found" } },
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
  const supabase = await createClient();

  const { data: deleted, error: deleteError } = await supabase
    .from("scholars")
    .update({ is_active: false })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (deleteError) {
    console.error("Error deactivating scholar:", deleteError);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to deactivate scholar",
        },
      },
      { status: 500 },
    );
  }

  if (!deleted) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Scholar not found" } },
      { status: 404 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
