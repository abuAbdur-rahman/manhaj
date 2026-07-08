import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "INVALID_JSON", message: "Malformed JSON" } },
      { status: 400 },
    );
  }

  const result = ForgotPasswordSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Valid email required" } },
      { status: 422 },
    );
  }

  const { email } = result.data;

  const emailCheck = await checkRateLimit(email, "forgot_password");
  if (!emailCheck.allowed) {
    return rateLimitResponse(emailCheck.retryAfterSeconds);
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipCheck = await checkRateLimit(`ip:${ip}`, "forgot_password");
  if (!ipCheck.allowed) {
    return rateLimitResponse(ipCheck.retryAfterSeconds);
  }

  const supabaseAdmin = createAdminClient();
  const { error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/admin/accept-invite`,
  });

  if (error?.status === 429) {
    return rateLimitResponse(60);
  }

  return NextResponse.json({ success: true });
}
