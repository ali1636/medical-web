// hooks/useAppointments.js
'use client';
import { useState, useCallback } from 'react';
import { getLocalAppointments, saveLocalAppointments } from '@/lib/utils';
import { apiFetchAllAppointments, apiUpdateAppointment } from '@/lib/api';

/**
 * useAppointments
 * Centralises all appointment state and actions.
 * Patient-side reads from localStorage (instant).
 * Admin-side reads from Supabase (via API route).
 *
 * Returns everything the App component and its children need.
 */
export function useAppointments(showToast) {
  const [appointments, setAppointments] = useState(() => getLocalAppointments());

  // ── Patient actions ─────────────────────────────────────────

  /** Reload patient appointments from localStorage */
  const refreshLocalAppointments = useCallback(() => {
    setAppointments(getLocalAppointments());
  }, []);

  /** Add a newly booked appointment to local state */
  const addLocalAppointment = useCallback((appointment) => {
    const existing = getLocalAppointments();
    const updated  = [...existing, appointment];
    saveLocalAppointments(updated);
    setAppointments(updated);
  }, []);

  /** Cancel a pending appointment (patient action) */
  const cancelAppointment = useCallback(async (id) => {
    // Optimistic update — remove from UI immediately
    const updated = getLocalAppointments().filter((a) => a.id !== id);
    saveLocalAppointments(updated);
    setAppointments(updated);
    // Sync to Supabase in background
    try {
      await apiUpdateAppointment(id, { status: 'Cancelled' }, true);
    } catch (err) {
      console.error('Cancel sync error:', err);
    }
    showToast('Appointment cancelled', 'info');
  }, [showToast]);

  // ── Admin actions ───────────────────────────────────────────

  /** Fetch ALL appointments from Supabase (admin only) */
  const refreshAdminAppointments = useCallback(async () => {
    try {
      const data = await apiFetchAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Admin refresh error:', err);
      // Silently fail — user may not be admin
    }
  }, []);

  /** Update a single appointment's status (admin) */
  const updateAppointmentStatus = useCallback(async (id, status) => {
    try {
      await apiUpdateAppointment(id, { status });
    } catch (err) {
      console.error('Status update error:', err);
    }
  }, []);

  /** Send a custom message to a patient (admin) */
  const sendMessageToPatient = useCallback(async (id, message) => {
    try {
      await apiUpdateAppointment(id, { adminMessage: message });
    } catch (err) {
      console.error('Message send error:', err);
    }
  }, []);

  return {
    appointments,
    // Patient
    refreshLocalAppointments,
    addLocalAppointment,
    cancelAppointment,
    // Admin
    refreshAdminAppointments,
    updateAppointmentStatus,
    sendMessageToPatient,
  };
}