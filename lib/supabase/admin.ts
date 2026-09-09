import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "../utils";

export const createAdminClient = () =>
  createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  );
