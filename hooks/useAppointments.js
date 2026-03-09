// hooks/useAppointments.js
'use client';
import { useState, useEffect, useCallback } from 'react';
import { getLocalAppointments, saveLocalAppointments } from '@/lib/utils';
import { apiFetchAllAppointments, apiUpdateAppointment } from '@/lib/api';

export function useAppointments(showToast) {
  // Start with [] on both server and client to avoid hydration mismatch.
  // Load from localStorage only after mount (client-only).
  const [appointments, setAppointments] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setAppointments(getLocalAppointments());
  }, []);

  // ── Patient actions ─────────────────────────────────────────
  const refreshLocalAppointments = useCallback(() => {
    setAppointments(getLocalAppointments());
  }, []);

  const addLocalAppointment = useCallback((appointment) => {
    const existing = getLocalAppointments();
    const updated  = [...existing, appointment];
    saveLocalAppointments(updated);
    setAppointments(updated);
  }, []);

  const cancelAppointment = useCallback(async (id) => {
    const updated = getLocalAppointments().filter((a) => a.id !== id);
    saveLocalAppointments(updated);
    setAppointments(updated);
    try {
      await apiUpdateAppointment(id, { status: 'Cancelled' }, true);
    } catch (err) {
      console.error('Cancel sync error:', err);
    }
    showToast('Appointment cancelled', 'info');
  }, [showToast]);

  // ── Admin actions ───────────────────────────────────────────
  const refreshAdminAppointments = useCallback(async () => {
    try {
      const data = await apiFetchAllAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Admin refresh error:', err);
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (id, status) => {
    try {
      await apiUpdateAppointment(id, { status });
    } catch (err) {
      console.error('Status update error:', err);
    }
  }, []);

  const sendMessageToPatient = useCallback(async (id, message) => {
    try {
      await apiUpdateAppointment(id, { adminMessage: message });
    } catch (err) {
      console.error('Message send error:', err);
    }
  }, []);

  return {
    appointments,
    mounted,
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