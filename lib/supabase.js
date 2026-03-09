// lib/supabase.js
// Two clients:
//  - browserClient: used in page.jsx for Supabase Auth (admin login)
//  - serverClient:  used in API routes for database operations (uses service role key)

import { createBrowserClient } from '@supabase/ssr';
import { createClient }        from '@supabase/supabase-js';

// ── Browser client (Auth only — anon key, safe to expose) ────
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// ── Server client (API routes — service role key, server only) ─
export function createSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
}