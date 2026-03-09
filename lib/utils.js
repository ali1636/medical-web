// lib/utils.js
// ── Pure utility functions ──────────────────────────────────────
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes safely — required by shadcn/ui components */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const STORAGE_KEY = 'shibli_appointments';

/** Generate a short human-readable appointment ID */
export function generateId() {
  return `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Read patient's own appointments from localStorage */
export function getLocalAppointments() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

/** Persist patient's own appointments to localStorage */
export function saveLocalAppointments(list) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/**
 * Given an array of appointments and a date string (yyyy-MM-dd),
 * returns the list of time slots already booked on that date.
 * Used by the date picker to grey out unavailable slots.
 */
export function getBookedSlotsFromList(appointments, dateStr) {
  return appointments
    .filter((a) => a.date === dateStr && a.status !== 'Cancelled')
    .map((a) => a.time);
}