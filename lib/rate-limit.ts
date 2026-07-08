import { createAdminClient } from "@/lib/supabase/admin";

export type RateLimitAction = "forgot_password" | "login" | "change_password";

interface RateLimitConfig {
  max: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
  remaining: number;
}

const LIMITS: Record<RateLimitAction, RateLimitConfig> = {
  forgot_password: { max: 3, windowSeconds: 15 * 60 },
  login: { max: 8, windowSeconds: 10 * 60 },
  change_password: { max: 5, windowSeconds: 15 * 60 },
};

export async function checkRateLimit(
  identifier: string,
  action: RateLimitAction,
): Promise<RateLimitResult> {
  const config = LIMITS[action];
  const supabase = createAdminClient();
  const windowStart = new Date(
    Date.now() - config.windowSeconds * 1000,
  ).toISOString();

  const { data: recent, error } = await supabase
    .from("auth_rate_limits")
    .select("attempted_at")
    .eq("identifier", identifier.toLowerCase())
    .eq("action", action)
    .gte("attempted_at", windowStart)
    .order("attempted_at", { ascending: true });

  if (error) {
    console.error("rate-limit check failed", error);
    return { allowed: true, retryAfterSeconds: 0, remaining: config.max };
  }

  const count = recent?.length ?? 0;

  if (count >= config.max) {
    const oldest = new Date(recent[0].attempted_at).getTime();
    const retryAfterSeconds = Math.ceil(
      (oldest + config.windowSeconds * 1000 - Date.now()) / 1000,
    );
    return {
      allowed: false,
      retryAfterSeconds: Math.max(retryAfterSeconds, 1),
      remaining: 0,
    };
  }

  await supabase.from("auth_rate_limits").insert({
    identifier: identifier.toLowerCase(),
    action,
  });

  return {
    allowed: true,
    retryAfterSeconds: 0,
    remaining: config.max - count - 1,
  };
}

export function rateLimitResponse(retryAfterSeconds: number): Response {
  return Response.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Too many attempts. Please wait before trying again.",
        retryAfterSeconds,
      },
    },
    {
      status: 429,
      headers: { "Retry-After": String(retryAfterSeconds) },
    },
  );
}
