import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;
if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

export const MISSING_SUPABASE_ENV_MESSAGE =
  "Supabase env vars missing — copy .env.example to .env and set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, then restart the dev server.";

export function getSupabase(): SupabaseClient {
  if (!client) {
    throw new Error(MISSING_SUPABASE_ENV_MESSAGE);
  }
  return client;
}

// Kept for backwards compatibility. Accessing it without env configured
// throws a descriptive error at call time (not import time) so the app
// can render a setup notice instead of white-screening.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<PropertyKey, unknown>)[prop];
  },
});
