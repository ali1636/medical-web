// lib/api.js
// ── Browser-side API helpers ─────────────────────────────────────
import { createSupabaseBrowser } from '@/lib/supabase';

// Lazy singleton — only created in browser, never during SSR
let _supabase = null;
export function getSupabaseClient() {
  if (typeof window === 'undefined') return null;
  if (!_supabase) _supabase = createSupabaseBrowser();
  return _supabase;
}

/** Get the current admin's JWT token */
async function getAdminToken() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data: { session } } = await client.auth.getSession();
  return session?.access_token || null;
}

/** POST /api/appointments — public, no auth */
export async function apiCreateAppointment(appointment) {
  const res = await fetch('/api/appointments', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(appointment),
  });
  if (!res.ok) throw new Error('Failed to save appointment');
  return res.json();
}

/** GET /api/appointments — admin only */
export async function apiFetchAllAppointments() {
  const token = await getAdminToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('/api/appointments', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch appointments');
  const { appointments } = await res.json();
  return appointments;
}

/** PATCH /api/appointments/:id */
export async function apiUpdateAppointment(id, updates, patientCancel = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (!patientCancel) {
    const token = await getAdminToken();
    if (!token) throw new Error('Not authenticated');
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`/api/appointments/${id}`, {
    method:  'PATCH',
    headers,
    body:    JSON.stringify({ ...updates, patientCancel }),
  });
  if (!res.ok) throw new Error('Failed to update appointment');
  return res.json();
}