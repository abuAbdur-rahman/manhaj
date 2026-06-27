import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const CreateSeriesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  cover_url: z.string().optional(),
  is_featured: z.boolean().default(false),
  scholar_id: z.string().uuid().optional(),
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

  const body = await request.json();
  const result = CreateSeriesSchema.safeParse(body);
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

  const { title, description, cover_url, is_featured, scholar_id: bodyScholarId } = result.data;
  const supabase = await createClient();

  if (admin.role === "scholar_admin" && !admin.scholarId) {
    return NextResponse.json(
      {
        error: { code: "FORBIDDEN", message: "No scholar assigned" },
      },
      { status: 403 },
    );
  }

  const scholar_id =
    admin.role === "super_admin" ? (bodyScholarId ?? null) : admin.scholarId;

  if (!scholar_id) {
    return NextResponse.json(
      {
        error: { code: "VALIDATION_ERROR", message: "scholar_id is required" },
      },
      { status: 422 },
    );
  }

  const { data: scholarExists } = await supabase
    .from("scholars")
    .select("id")
    .eq("id", scholar_id)
    .eq("is_active", true)
    .single();

  if (!scholarExists) {
    return NextResponse.json(
      {
        error: { code: "NOT_FOUND", message: "Scholar not found" },
      },
      { status: 404 },
    );
  }

  const baseSlug = slugify(title);
  const uniqueSlug = baseSlug
    ? `${baseSlug}-${Date.now().toString(36)}`
    : `series-${Date.now().toString(36)}`;

  const { data: series, error: insertError } = await supabase
    .from("series")
    .insert({
      scholar_id,
      title,
      slug: uniqueSlug,
      description: description ?? null,
      cover_url: cover_url ?? null,
      is_featured,
    })
    .select("*, scholar:scholar_id(*)")
    .single();

  if (insertError) {
    console.error("Error creating series:", insertError);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to create series" },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(series, { status: 201 });
}
