import { createClient } from "@supabase/supabase-js";

// Server client — new instance per request.
// No singleton: Server Components run per-request, stale connections cause issues.
// Uses non-public env vars (server-only, never shipped to browser).

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_ANON_KEY!;

  return createClient(url, key);
}
