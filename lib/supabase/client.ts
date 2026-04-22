import { createClient } from "@supabase/supabase-js";

// Browser client — singleton pattern.
// Uses NEXT_PUBLIC_ vars so it works in client components.
// The anon key is safe to expose: RLS policies control what it can access.

let client: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowser() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  client = createClient(url, key);
  return client;
}
