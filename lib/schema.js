// lib/schema.js
// ── Zod validation schema for the booking form ──────────────────
import { z } from 'zod';

export const appointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number'),
  date:            z.string().min(1, 'Please select a date'),
  time:            z.string().min(1, 'Please select a time slot'),
  appointmentType: z.string().min(1, 'Please select an appointment type'),
  insurance:       z.string().optional(),
  reason:          z.string().max(300, 'Reason must be 300 characters or less').optional(),
  consent:         z.literal(true, { errorMap: () => ({ message: 'You must consent to proceed' }) }),
});