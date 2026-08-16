import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

/**
 * Lazily creates the Supabase client. Safe to import before environment
 * variables exist (Phase 0) — the client is only built on first use (Phase 1).
 * Uses the publishable anon key (RLS enforces authorization, never the
 * service-role key).
 */
export function getSupabase(): SupabaseClient {
  if (client) return client

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase env vars. Copy .env.example to .env and set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.',
    )
  }

  client = createClient(supabaseUrl, supabaseAnonKey)
  return client
}