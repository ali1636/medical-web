// lib/supabase.js
import { createClient } from '@supabase/supabase-js';

// ── Browser client (Auth only — lazy singleton) ──────────────────
let _browserClient = null;

export function createSupabaseBrowser() {
  if (typeof window === 'undefined') return null; // never run on server
  if (_browserClient) return _browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  _browserClient = createClient(url, key, {
    auth: { persistSession: true, storageKey: 'shibli-admin-session' },
  });
  return _browserClient;
}

// ── Server client (API routes only — service role key) ───────────
export function createSupabaseServer() {
  const url  = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key  = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}