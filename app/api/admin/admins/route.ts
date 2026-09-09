import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const CreateAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["super_admin", "scholar_admin"]),
  scholar_id: z.string().uuid().nullable().optional(),
});

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

  const result = CreateAdminSchema.safeParse(body);
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

  const { name, email, role, scholar_id } = result.data;

  if (role === "scholar_admin" && !scholar_id) {
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
  const adminClient = createAdminClient();

  const { data: existingAdmin } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existingAdmin) {
    return NextResponse.json(
      {
        error: {
          code: "CONFLICT",
          message: "An admin with this email already exists",
        },
      },
      { status: 409 },
    );
  }

  const { data: invited, error: inviteError } =
    await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite`,
      data: { name },
    });

  if (inviteError || !invited.user) {
    if (inviteError?.status === 429) {
      return NextResponse.json(
        {
          error: {
            code: "RATE_LIMITED",
            message: "Too many invites sent recently. Try again shortly.",
            retryAfterSeconds: 60,
          },
        },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
    console.error("Error inviting admin:", inviteError);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to send invite",
        },
      },
      { status: 500 },
    );
  }

  const { data: newAdmin, error: insertError } = await supabase
    .from("admins")
    .insert({
      id: invited.user.id,
      name,
      email,
      role,
      scholar_id: role === "scholar_admin" ? scholar_id : null,
      invited_by: admin.id,
    })
    .select("*, scholar:scholar_id(id, name)")
    .single();

  if (insertError) {
    console.error("Error inserting admin record:", insertError);
    await adminClient.auth.admin.deleteUser(invited.user.id);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create admin record",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(newAdmin, { status: 201 });
}
