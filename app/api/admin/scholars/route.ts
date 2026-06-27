import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const CreateScholarSchema = z.object({
  name: z.string().min(1, "Name is required"),
  bio: z.string().nullable().optional(),
  photo_url: z.string().nullable().optional(),
  languages: z.array(z.enum(["yoruba", "english", "arabic"])).default([]),
  social_links: z
    .object({
      youtube: z.string().optional(),
      telegram: z.string().optional(),
      whatsapp: z.string().optional(),
      website: z.string().optional(),
    })
    .optional(),
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

  if (admin.role !== "super_admin") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Super admin role required" } },
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
  const result = CreateScholarSchema.safeParse(body);
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

  const { name, bio, photo_url, languages, social_links } = result.data;
  const supabase = await createClient();

  const baseSlug = slugify(name);
  const uniqueSlug = `${baseSlug}-${Date.now().toString(36)}`;

  const { data: scholar, error: insertError } = await supabase
    .from("scholars")
    .insert({
      name,
      slug: uniqueSlug,
      bio: bio ?? null,
      photo_url: photo_url ?? null,
      languages,
      social_links: social_links ?? {},
    })
    .select("*")
    .single();

  if (insertError) {
    console.error("Error creating scholar:", insertError);
    return NextResponse.json(
      {
        error: { code: "INTERNAL_ERROR", message: "Failed to create scholar" },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(scholar, { status: 201 });
}
