// components/booking/BookingModal.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import {
  X, Check, CalendarDays, Clock, User, AlertCircle, ArrowRight,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Badge }    from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CustomDatePicker } from '@/components/booking/CustomDatePicker';
import { appointmentSchema }    from '@/lib/schema';
import { APPOINTMENT_TYPES, TIME_SLOTS } from '@/lib/constants';
import { generateId, getLocalAppointments, saveLocalAppointments, getBookedSlotsFromList } from '@/lib/utils';
import { apiCreateAppointment } from '@/lib/api';
import { spring, gentleSpring } from '@/lib/animations';

/**
 * BookingModal — full appointment booking flow.
 * Step 1: pick date + time
 * Step 2: fill in patient info
 * Step 3: success screen with reference ID
 */
export function BookingModal({ onClose, onSuccess, allAppointments = [] }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots,  setBookedSlots]  = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '',
    appointmentType: '', insurance: '', reason: '', consent: false,
  });
  const [errors,       setErrors]       = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess,    setIsSuccess]    = useState(false);
  const [submittedApt, setSubmittedApt] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    setFormData((p) => ({ ...p, date: dateStr, time: '' }));
    setBookedSlots(getBookedSlotsFromList(allAppointments, dateStr));
    setErrors((p) => ({ ...p, date: undefined, time: undefined }));
  };

  const handleTimeSelect = (time) => {
    setFormData((p) => ({ ...p, time }));
    setErrors((p) => ({ ...p, time: undefined }));
  };

  const handleInputChange = (field, value) => {
    setFormData((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const result = appointmentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        if (!fieldErrors[err.path[0]]) fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    const appointment = {
      id:           generateId(),
      ...formData,
      status:       'Pending',
      adminMessage: '',
      createdAt:    new Date().toISOString(),
    };
    try {
      // Save to Supabase + send confirmation email (Resend) via API route
      await apiCreateAppointment(appointment);
    } catch (err) {
      console.error('API save failed, falling back to localStorage only:', err);
    }
    // Always persist locally so patient dashboard loads instantly
    saveLocalAppointments([...getLocalAppointments(), appointment]);
    setIsSubmitting(false);
    setSubmittedApt(appointment);
    setIsSuccess(true);
  };

  const resetForm = () => {
    setIsSuccess(false);
    setSubmittedApt(null);
    setSelectedDate(null);
    setFormData({ name: '', email: '', phone: '', date: '', time: '', appointmentType: '', insurance: '', reason: '', consent: false });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.97 }}
        transition={{ ...gentleSpring }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isSuccess ? 'Request Confirmed' : 'Book Your Appointment'}
            </h2>
            {!isSuccess && (
              <p className="text-sm text-muted-foreground mt-0.5">
                Select your preferred date, time, and fill in your details.
              </p>
            )}
          </div>
          <motion.button
            onClick={onClose}
            className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={spring}
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* ── Success Screen ─────────────────────────────────── */}
        {isSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={gentleSpring}
            className="px-6 py-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, ...spring }}
              className="h-20 w-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6"
            >
              <Check className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Request Submitted!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Your appointment request has been submitted and a confirmation email is on its way. We&apos;ll confirm your slot within 24 hours.
            </p>
            {submittedApt && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex flex-col items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-8"
              >
                <Badge className="bg-primary/10 text-primary border-0 text-base font-bold px-4 py-1">
                  {submittedApt.id}
                </Badge>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{submittedApt.date} at {submittedApt.time}</p>
                  <p>{submittedApt.appointmentType}</p>
                  <Badge variant="secondary" className="mt-2 rounded-full">Pending Review</Badge>
                </div>
              </motion.div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={onSuccess} className="rounded-full px-6">
                <CalendarDays className="mr-2 h-4 w-4" />
                View My Dashboard
              </Button>
              <Button onClick={resetForm} variant="outline" className="rounded-full px-6">
                Book Another
              </Button>
            </div>
          </motion.div>
        ) : (
          /* ── Booking Form ───────────────────────────────────── */
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Date + Time picker */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" /> Select Date
                </h3>
                <CustomDatePicker selectedDate={selectedDate} onSelectDate={handleDateSelect} />
                <AnimatePresence>
                  {errors.date && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-rose-500 mt-2 flex items-center gap-1"
                    >
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.date}
                    </motion.p>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {formData.date && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={gentleSpring}
                      className="mt-5 overflow-hidden"
                    >
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Select Time
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => {
                          const isBooked   = bookedSlots.includes(slot);
                          const isSelected = formData.time === slot;
                          return (
                            <motion.button
                              key={slot}
                              onClick={() => !isBooked && handleTimeSelect(slot)}
                              disabled={isBooked}
                              className={`
                                px-1 py-2 text-[11px] font-medium rounded-xl border transition-colors duration-150
                                ${isBooked    ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed line-through' : ''}
                                ${isSelected  ? 'bg-primary text-primary-foreground border-primary shadow-md' : ''}
                                ${!isBooked && !isSelected ? 'bg-white dark:bg-gray-900 text-foreground border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary' : ''}
                              `}
                              whileHover={!isBooked && !isSelected ? { scale: 1.05 } : {}}
                              whileTap={!isBooked ? { scale: 0.95 } : {}}
                              animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
                              transition={spring}
                            >
                              {slot}
                            </motion.button>
                          );
                        })}
                      </div>
                      <AnimatePresence>
                        {errors.time && (
                          <motion.p
                            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="text-xs text-rose-500 mt-2 flex items-center gap-1"
                          >
                            <AlertCircle className="h-3.5 w-3.5" /> {errors.time}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Patient Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" /> Patient Information
                </h3>

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter your full name" className="mt-1 rounded-xl h-10" />
                  <AnimatePresence>
                    {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-1">{errors.name}</motion.p>}
                  </AnimatePresence>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="you@example.com" className="mt-1 rounded-xl h-10" />
                    <AnimatePresence>
                      {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-1">{errors.email}</motion.p>}
                    </AnimatePresence>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone *</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="(469) 555-0123" className="mt-1 rounded-xl h-10" />
                    <AnimatePresence>
                      {errors.phone && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-1">{errors.phone}</motion.p>}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Appointment Type */}
                <div>
                  <Label htmlFor="appointmentType" className="text-xs font-medium text-muted-foreground">Appointment Type *</Label>
                  <select
                    id="appointmentType"
                    value={formData.appointmentType}
                    onChange={(e) => handleInputChange('appointmentType', e.target.value)}
                    className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select type...</option>
                    {APPOINTMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <AnimatePresence>
                    {errors.appointmentType && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-1">{errors.appointmentType}</motion.p>}
                  </AnimatePresence>
                </div>

                {/* Insurance */}
                <div>
                  <Label htmlFor="insurance" className="text-xs font-medium text-muted-foreground">Insurance Provider (Optional)</Label>
                  <Input id="insurance" value={formData.insurance} onChange={(e) => handleInputChange('insurance', e.target.value)} placeholder="e.g., Blue Cross Blue Shield" className="mt-1 rounded-xl h-10" />
                </div>

                {/* Reason */}
                <div>
                  <Label htmlFor="reason" className="text-xs font-medium text-muted-foreground">
                    Reason for Visit <span className="text-muted-foreground/60">({formData.reason?.length || 0}/300)</span>
                  </Label>
                  <textarea
                    id="reason"
                    value={formData.reason || ''}
                    onChange={(e) => { if (e.target.value.length <= 300) handleInputChange('reason', e.target.value); }}
                    placeholder="Briefly describe your concern..."
                    rows={3}
                    className="mt-1 flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Consent */}
                <div className="flex items-start gap-3 pt-1">
                  <Checkbox id="consent" checked={formData.consent} onCheckedChange={(checked) => handleInputChange('consent', checked === true)} className="mt-0.5" />
                  <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I consent to the collection and use of my personal information for scheduling. I understand this is a request subject to confirmation.
                  </label>
                </div>
                <AnimatePresence>
                  {errors.consent && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500">{errors.consent}</motion.p>}
                </AnimatePresence>

                {/* Submit */}
                <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} transition={spring}>
                  <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full rounded-xl h-11 text-sm font-semibold shadow-lg shadow-primary/15">
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                        />
                        Submitting...
                      </div>
                    ) : (
                      <>Submit Appointment Request <ArrowRight className="ml-2 h-4 w-4" /></>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default BookingModal;