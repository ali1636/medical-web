// lib/api.js
// ── Browser-side API helpers (call your Next.js API routes) ─────
// All Supabase DB writes happen server-side in the API routes.
// These functions are just thin fetch wrappers used by components.

import { createSupabaseBrowser } from '@/lib/supabase';

const supabase = createSupabaseBrowser();

/** Get the current admin's JWT token for authenticated requests */
async function getAdminToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}

/**
 * POST /api/appointments
 * Creates a new appointment in Supabase and sends
 * a booking confirmation email to the patient via Resend.
 * Public — no auth required.
 */
export async function apiCreateAppointment(appointment) {
  const res = await fetch('/api/appointments', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(appointment),
  });
  if (!res.ok) throw new Error('Failed to save appointment');
  return res.json();
}

/**
 * GET /api/appointments
 * Fetches all appointments from Supabase.
 * Admin only — requires a valid Supabase session token.
 */
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

/**
 * PATCH /api/appointments/:id
 * Updates an appointment's status and/or adminMessage.
 * Admin actions: sends a reply email to the patient.
 * Patient cancel: passes patientCancel=true to skip auth.
 *
 * @param {string} id           - Appointment ID
 * @param {object} updates      - { status?, adminMessage? }
 * @param {boolean} patientCancel - Skip auth check (patient cancellations only)
 */
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

/** Export the supabase client for use in auth-related component actions */
export { supabase };