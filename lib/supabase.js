// lib/supabase.js
'use client';
import { createClient } from '@supabase/supabase-js';

let _browserClient = null;

export function createSupabaseBrowser() {
  if (typeof window === 'undefined') return null;
  if (_browserClient) return _browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Validate URL before passing to createClient — avoids throw on empty/missing vars
  if (!url || !key || !url.startsWith('http')) return null;

  try {
    _browserClient = createClient(url, key, {
      auth: { persistSession: true, storageKey: 'shibli-admin-session' },
    });
  } catch (e) {
    console.warn('Supabase client init failed:', e.message);
    return null;
  }

  return _browserClient;
}

export function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !url.startsWith('http')) return null;
  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (e) {
    console.warn('Supabase server client init failed:', e.message);
    return null;
  }
}