'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { z } from 'zod';
import {
  format, startOfDay, addMonths, getDaysInMonth, getDay,
  isBefore, isAfter, isSameDay, startOfMonth, addDays,
} from 'date-fns';
import { useTheme } from 'next-themes';
import {
  Stethoscope, FileText, Video, Shield, MapPin, Phone, Mail,
  Clock, Award, Star, ChevronRight, ChevronLeft, X, Check, AlertCircle,
  Sun, Moon, Menu, User, Trash2, Heart, Activity,
  Calendar as CalendarIcon, GraduationCap, BadgeCheck, CalendarDays, ArrowRight,
  Settings, Lock, CheckCircle, XCircle, MessageSquare, Send,
  Search, Download, Filter, Bell, Globe, Languages, Sparkles,
  ExternalLink, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// ============================================================
// CONSTANTS
// ============================================================

const DOCTOR = {
  name: 'Dr. Urooj Shibli',
  credentials: 'MD, ABFM',
  specialty: 'Family Medicine & Obesity Specialist',
  practice: 'Shibli Family Medicine & Obesity Clinic',
  location: 'Mesquite, TX (Dallas Area)',
  address: '802 US Highway 80 E, Mesquite, TX 75149',
  phone: '(469) 827-7300',
  email: 'info@shiblimed.com',
  hours: 'Monday - Friday: 9:00 AM - 5:00 PM',
  closedDays: 'Saturday & Sunday: Closed',
  experience: '15+',
  image:
    'https://dims.healthgrades.com/dims3/MMH/0b1ebc4/2147483647/strip/true/crop/4749x7116+0+0/resize/4749x7116!/quality/75/?url=https%3A%2F%2Fucmscdn.healthgrades.com%2Fec%2F66%2F588039cf4a0690eab411337cd316%2Fy4q6x-urooj-shibli.jpg',
  bio: 'Dr. Urooj Shibli, MD is a board certified family medicine and obesity medicine specialist located in Texas. She has over 15 years of experience and has established a solid reputation for her pleasant disposition, ability to build a warm rapport with her patients, being a good listener and for providing clear, easy to follow diagnosis and treatment plans.',
  education: 'Ziauddin Medical University, 2004 (Gold Medal)',
  residency: 'Family Medicine Residency — Forbes / Allegheny Health Network, 2009',
  boardCert: 'American Board of Family Medicine (ABFM) & American Board of Obesity Medicine',
  awards: [
    'Gold Medal — Top Graduate',
    'Best Geriatric Resident Award',
    'Committed to Patient Care (3×)',
    'On-Time Doctor Award (2018)',
  ],
  languages: ['English', 'Urdu', 'Punjabi', 'Basic Spanish', 'Basic Hindi'],
  specialties: [
    'Family & Primary Care',
    'Obesity & Weight Loss',
    'Pediatrics & Adolescent Care',
    'Geriatric Care',
    "Women's Health",
    'Chronic Disease Management',
    'Telemedicine / Virtual',
    'Cardiac Testing',
    'Preventive Screenings',
    'Wellness Counseling',
  ],
};

const SERVICES = [
  {
    name: 'General Consultation',
    duration: '30 min',
    price: '$100',
    description: 'Comprehensive health assessment with a personalized treatment plan tailored to your unique needs.',
    icon: 'stethoscope',
    color: 'blue',
  },
  {
    name: 'Follow-up Visit',
    duration: '15 min',
    price: '$50',
    description: 'Review your progress and fine-tune your treatment plan for optimal health outcomes.',
    icon: 'filetext',
    color: 'violet',
  },
  {
    name: 'Telehealth Call',
    duration: '20 min',
    price: '$80',
    description: 'Professional medical consultation from the comfort and privacy of your own home.',
    icon: 'video',
    color: 'emerald',
  },
  {
    name: 'Vaccination',
    duration: '10 min',
    price: '$30',
    description: 'Stay protected with preventive immunizations administered by our experienced team.',
    icon: 'shield',
    color: 'rose',
  },
];

const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM',
  '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM',
];

const APPOINTMENT_TYPES = [
  'General Consultation',
  'Follow-up Visit',
  'Telehealth Call',
  'Vaccination / Flu Shot',
];

const ADMIN_PASSWORD = 'admin123';
const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';
const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
const STORAGE_KEY = 'shibli_appointments';

// ============================================================
// VALIDATION
// ============================================================

const appointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time slot'),
  appointmentType: z.string().min(1, 'Please select an appointment type'),
  insurance: z.string().optional(),
  reason: z.string().max(300, 'Reason must be 300 characters or less').optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'You must consent to proceed' }) }),
});

// ============================================================
// UTILITIES
// ============================================================

function getAppointments() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveAppointments(appointments) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
}

function generateId() {
  return `REQ-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getBookedSlots(dateStr) {
  return getAppointments()
    .filter((apt) => apt.date === dateStr && apt.status !== 'Cancelled')
    .map((apt) => apt.time);
}

async function sendEmail(data) {
  if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID') {
    console.info('%c EmailJS: Placeholder mode', 'color:#2563eb;font-weight:bold');
    return { success: true };
  }
  try {
    const emailjs = (await import('@emailjs/browser')).default;
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        patient_name: data.name,
        patient_email: data.email,
        patient_phone: data.phone,
        appointment_date: data.date,
        appointment_time: data.time,
        appointment_type: data.appointmentType,
        insurance: data.insurance || 'Not provided',
        reason: data.reason || 'Not specified',
        appointment_id: data.id,
      },
      EMAILJS_PUBLIC_KEY
    );
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
}

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const spring = { type: 'spring', stiffness: 400, damping: 30 };
const gentleSpring = { type: 'spring', stiffness: 200, damping: 25 };

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92, filter: 'blur(4px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ============================================================
// ANIMATED SECTION WRAPPER
// ============================================================

function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ============================================================
// SERVICE ICON
// ============================================================

function ServiceIcon({ type, className }) {
  const icons = { stethoscope: Stethoscope, filetext: FileText, video: Video, shield: Shield };
  const Icon = icons[type] || Stethoscope;
  return <Icon className={className} />;
}

// ============================================================
// TOAST
// ============================================================

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800',
    error: 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800',
    info: 'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, x: '-50%', scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
      exit={{ opacity: 0, y: -16, x: '-50%', scale: 0.95 }}
      transition={gentleSpring}
      className="fixed top-4 left-1/2 z-[100] max-w-sm w-full"
    >
      <div className={`rounded-2xl border-2 shadow-2xl shadow-black/10 px-5 py-3.5 flex items-center gap-3 ${colors[type] || colors.info}`}>
        {type === 'success' && <CheckCircle className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
        {type === 'error' && <XCircle className="h-4.5 w-4.5 text-rose-600 dark:text-rose-400 flex-shrink-0" />}
        {type === 'info' && <Bell className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
        <p className="text-sm font-semibold text-foreground flex-1">{message}</p>
        <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// HEADER
// ============================================================

function Header({ scrolled, currentView, setCurrentView, onBook, scrollToSection, appointmentCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <motion.header
      initial={false}
      animate={scrolled
        ? { backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)' }
        : { backgroundColor: 'rgba(255,255,255,0)', backdropFilter: 'blur(0px)' }
      }
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 dark:!bg-gray-950/80 ${scrolled ? 'shadow-sm border-b border-gray-200/50 dark:border-gray-800/50' : ''}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={spring}
          >
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Heart className="h-4 w-4 text-primary" />
            </div>
            <span className="hidden sm:block text-base font-semibold tracking-tight text-foreground">
              Shibli Family Medicine
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {[{ label: 'Home', id: 'hero' }, { label: 'Services', id: 'services' }, { label: 'About', id: 'about' }].map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
              >
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {mounted && (
              <motion.button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.08, rotate: 12 }}
                whileTap={{ scale: 0.92 }}
                transition={spring}
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait">
                  <motion.div key={resolvedTheme} initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }}>
                    {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            )}
            <motion.button
              onClick={() => { setCurrentView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              title="Admin"
            >
              <Settings className="h-4 w-4" />
            </motion.button>
            <motion.button
              onClick={() => { setCurrentView('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              transition={spring}
            >
              <CalendarDays className="h-4 w-4" />
              <span>My Appointments</span>
              <AnimatePresence>
                {appointmentCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={spring}
                    className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-primary text-primary-foreground text-[11px] font-bold rounded-full flex items-center justify-center"
                  >
                    {appointmentCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
              <Button onClick={onBook} size="sm" className="rounded-full px-5 h-9 text-sm font-medium shadow-none">
                Book Appointment
              </Button>
            </motion.div>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            {mounted && (
              <motion.button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                transition={spring}
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.button>
            )}
            <motion.button
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
            >
              <AnimatePresence mode="wait">
                <motion.div key={mobileOpen ? 'close' : 'open'} initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.15 }}>
                  {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden bg-white/98 dark:bg-gray-950/98 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="px-4 py-3 space-y-1"
            >
              {[
                { label: 'Home', id: 'hero' },
                { label: 'Services', id: 'services' },
                { label: 'About', id: 'about' },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  variants={fadeUp}
                  onClick={() => { scrollToSection(item.id); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button variants={fadeUp} onClick={() => { setCurrentView('admin'); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Admin Dashboard
              </motion.button>
              <motion.button variants={fadeUp} onClick={() => { setCurrentView('dashboard'); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                My Appointments {appointmentCount > 0 && `(${appointmentCount})`}
              </motion.button>
              <motion.div variants={fadeUp} className="px-4 pt-2 pb-1">
                <Button onClick={() => { onBook(); setMobileOpen(false); }} className="w-full rounded-full h-10 text-sm font-medium">
                  Book Appointment
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ============================================================
// HERO SECTION
// ============================================================

function HeroSection({ onBook, onViewServices }) {
  const [imgError, setImgError] = useState(false);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20" />
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100/20 dark:bg-violet-900/10 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-rose-100/10 dark:bg-rose-900/5 rounded-full blur-[80px]" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/8 text-primary text-sm font-medium mb-6 border border-primary/15">
              <Sparkles className="h-3.5 w-3.5" />
              Board Certified Family Medicine
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.06] mb-6">
              Expert Care{' '}
              <span className="text-primary relative">
                You Can Trust.
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary/30 rounded-full origin-left"
                />
              </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              {DOCTOR.name}, {DOCTOR.credentials}. Providing compassionate, patient-centered healthcare for over{' '}
              {DOCTOR.experience} years in the Dallas-Mesquite area.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-12">
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Button onClick={onBook} size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/20">
                  Book Appointment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Button onClick={onViewServices} variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-medium border-2">
                  View Services
                </Button>
              </motion.div>
            </motion.div>

            <motion.div variants={stagger} className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                { icon: Award, label: `${DOCTOR.experience} Years Experience` },
                { icon: BadgeCheck, label: 'ABFM Certified' },
                { icon: Heart, label: 'Patient-Centered' },
              ].map((badge, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <badge.icon className="h-4 w-4 text-primary/60" />
                  <span>{badge.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-violet-500/10 rounded-[2.5rem] rotate-2 blur-sm" />
              <div className="absolute -inset-3 bg-gradient-to-br from-blue-100/60 to-violet-100/40 dark:from-blue-900/20 dark:to-violet-900/10 rounded-[2.5rem] rotate-2" />

              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 max-w-xs lg:max-w-sm">
                {!imgError ? (
                  <img
                    src={DOCTOR.image}
                    alt={`${DOCTOR.name} - Family Physician`}
                    className="w-full h-auto object-cover object-top aspect-[3/4]"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/30 dark:to-violet-900/30 flex items-center justify-center">
                    <div className="text-center">
                      <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl font-bold text-primary">US</span>
                      </div>
                      <p className="text-lg font-semibold text-foreground">{DOCTOR.name}</p>
                      <p className="text-sm text-muted-foreground">{DOCTOR.credentials}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Accepting patients badge */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.9, ...gentleSpring }}
                className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/8 p-4 border border-gray-100 dark:border-gray-800 max-w-[260px]"
              >
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-emerald-200 dark:border-emerald-800">
                      <img src={DOCTOR.image} alt="Dr. Urooj Shibli" className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center border-2 border-white dark:border-gray-900">
                      <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Accepting New Patients</p>
                    <p className="text-xs text-muted-foreground">Mon – Fri, 9AM – 5PM</p>
                  </div>
                </div>
              </motion.div>

              {/* Rating badge */}
              <motion.div
                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ delay: 1.1, ...gentleSpring }}
                className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/8 p-3.5 border border-gray-100 dark:border-gray-800"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 text-violet-500 fill-violet-500" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-foreground">4.8</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">Patient Rating</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div style={{ opacity }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-start justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ============================================================
// SERVICES SECTION
// ============================================================

const serviceColors = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    icon: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
    badge: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    hover: 'group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    icon: 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400',
    badge: 'bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400',
    hover: 'group-hover:bg-violet-100 dark:group-hover:bg-violet-900/50',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    icon: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
    badge: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    hover: 'group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    icon: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
    badge: 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400',
    hover: 'group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50',
  },
};

function ServicesSection({ onBook }) {
  return (
    <section id="services" className="py-24 sm:py-32 bg-slate-50/60 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <span className="text-sm font-semibold text-primary tracking-widest uppercase">Our Services</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Comprehensive Care
          </h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            From routine checkups to specialized treatment — all under one roof.
          </p>
        </Reveal>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {SERVICES.map((service, index) => {
            const c = serviceColors[service.color] || serviceColors.blue;
            return (
              <motion.div key={index} variants={fadeUp}>
                <motion.div
                  className={`group relative bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col overflow-hidden cursor-default`}
                  whileHover={{ y: -6, shadow: '0 20px 60px rgba(0,0,0,0.10)' }}
                  transition={gentleSpring}
                >
                  {/* Subtle background on hover */}
                  <div className={`absolute inset-0 ${c.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-5">
                      <motion.div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-300 ${c.icon} ${c.hover}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={spring}
                      >
                        <ServiceIcon type={service.icon} className="h-6 w-6" />
                      </motion.div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.badge}`}>
                        {service.duration}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-foreground">{service.price}</span>
                      <motion.button
                        onClick={onBook}
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all duration-200"
                        whileHover={{ x: 3 }}
                        transition={spring}
                      >
                        Book Now
                        <ChevronRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// ABOUT SECTION
// ============================================================

function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main About */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/8 to-violet-500/8 rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/team-photo.png"
                  alt="Dr. Urooj Shibli and the Shibli Family Medicine team"
                  className="w-full h-auto object-cover object-center aspect-[4/3]"
                  onError={(e) => {
                    e.currentTarget.src = DOCTOR.image;
                    e.currentTarget.className = 'w-full h-auto object-cover object-top aspect-[4/5]';
                  }}
                />
                {/* Team overlay label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                  <p className="text-white text-sm font-semibold">Our Care Team</p>
                  <p className="text-white/70 text-xs">Dedicated to your health & wellbeing</p>
                </div>
              </div>
              {/* Floating card */}
              <motion.div
                className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-gray-800"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, ...gentleSpring }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-violet-500 fill-violet-500" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">Highly Rated</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">500+ patient reviews</p>
              </motion.div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <span className="text-sm font-semibold text-primary tracking-widest uppercase">About {DOCTOR.name}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Your Partner in Health & Wellness
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">{DOCTOR.bio}</p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Dr Shibli has established a solid reputation and is well known for her pleasant disposition, ability to
              build a warm rapport with her patients, being a good listener and for providing clear, easy to follow
              diagnosis and treatment plans.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              She has recently established her own private practice and is accepting both old and new patients. At
              Shibli Family Medicine and Obesity Clinic, we are committed to providing you with the most exceptional
              care in a compassionate and friendly atmosphere.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: GraduationCap, label: 'Education', value: DOCTOR.education },
                { icon: Activity, label: 'Residency', value: DOCTOR.residency },
                { icon: BadgeCheck, label: 'Board Certifications', value: DOCTOR.boardCert },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, ...gentleSpring }}
                >
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Education Timeline */}
        <Reveal className="mb-24">
          <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Education & Training Timeline</h3>
          <p className="text-muted-foreground text-center mb-10 text-sm">Dr. Shibli's medical education and professional journey</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { color: 'blue', year: '2004', label: 'MEDICAL SCHOOL', title: 'Ziauddin Medical University', sub: 'Gold Medal — Karachi, Pakistan', Icon: GraduationCap },
              { color: 'violet', year: '2007', label: 'INTERNSHIP', title: 'General Internship', sub: 'Forbes Regional Hospital, PA', Icon: Activity },
              { color: 'emerald', year: '2009', label: 'RESIDENCY', title: 'Family Medicine Residency', sub: 'Forbes / Allegheny Health Network', Icon: BadgeCheck },
            ].map((item, i) => {
              const c = serviceColors[item.color] || serviceColors.blue;
              return (
                <motion.div
                  key={i}
                  className={`${c.bg} rounded-2xl border-2 p-6`}
                  style={{ borderColor: `var(--${item.color}-200, #e2e8f0)` }}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, ...gentleSpring }}
                  whileHover={{ y: -4 }}
                >
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-4 ${c.icon}`}>
                    <item.Icon className="h-6 w-6" />
                  </div>
                  <p className={`text-xs font-bold mb-2 ${c.icon.split(' ')[2]} ${c.icon.split(' ')[3]}`}>
                    {item.year} — {item.label}
                  </p>
                  <p className="text-base font-bold text-foreground mb-1">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.sub}</p>
                </motion.div>
              );
            })}
          </div>
        </Reveal>

        {/* Professional Experience */}
        <Reveal className="mb-24">
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 dark:from-slate-800 dark:to-blue-900 rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.3),transparent_60%)]" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Heart className="h-7 w-7 text-rose-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">Professional Experience</h3>
                  <p className="text-sm text-blue-300 font-medium">Clinical leadership & practice ownership</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-4xl font-extrabold text-white mb-2">15–20+</p>
                  <p className="text-sm text-blue-200">Years in primary care, preventive medicine & weight management</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white mb-2">Founder & Lead Physician</p>
                  <p className="text-sm text-blue-200">Shibli Family Medicine & Obesity Clinic — Mesquite, TX</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Awards & Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          <Reveal>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Awards & Recognitions
            </h3>
            <div className="space-y-3">
              {DOCTOR.awards.map((award, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08, ...gentleSpring }}
                  whileHover={{ x: 4 }}
                >
                  <div className="h-8 w-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{award}</p>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Languages Spoken
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Care available in multiple languages</p>
            <div className="flex flex-wrap gap-2">
              {DOCTOR.languages.map((lang, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, ...spring }}
                  whileHover={{ scale: 1.05, y: -2 }}
                >
                  <Badge variant="secondary" className="rounded-full text-sm font-medium px-4 py-2 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-0">
                    <Globe className="h-3.5 w-3.5 mr-1.5" />
                    {lang}
                  </Badge>
                </motion.div>
              ))}
            </div>

            {/* Experience card */}
            <div className="mt-8 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-blue-950/30 dark:to-violet-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                </div>
                <p className="font-semibold text-foreground">Double Board Certified</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{DOCTOR.boardCert}</p>
            </div>
          </Reveal>
        </div>

        {/* Specialties */}
        <Reveal>
          <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Specialties & Services</h3>
          <p className="text-muted-foreground text-center text-sm mb-10">Comprehensive clinic services for all ages</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {DOCTOR.specialties.map((specialty, i) => (
              <motion.div
                key={i}
                className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center cursor-default"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, ...spring }}
                whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,0,0,0.08)' }}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground leading-tight">{specialty}</p>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

// ============================================================
// TRUST SECTION
// ============================================================

function TrustSection() {
  const stats = [
    { value: '15+', label: 'Years Experience', color: 'text-blue-600 dark:text-blue-400' },
    { value: '10K+', label: 'Patients Served', color: 'text-violet-600 dark:text-violet-400' },
    { value: 'ABFM', label: 'Board Certified', color: 'text-emerald-600 dark:text-emerald-400' },
    { value: '4.8★', label: 'Patient Rating', color: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <section className="py-20 bg-slate-50/60 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeUp} className="text-center">
              <motion.p
                className={`text-3xl sm:text-4xl font-bold ${stat.color}`}
                initial={{ scale: 0.5, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, ...spring }}
              >
                {stat.value}
              </motion.p>
              <p className="mt-1 text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// CUSTOM DATE PICKER
// ============================================================

function CustomDatePicker({ selectedDate, onSelectDate }) {
  const today = startOfDay(new Date());
  const maxDate = addMonths(today, 3);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  const daysInMonth = getDaysInMonth(viewMonth);
  const firstDayOfWeek = getDay(viewMonth);
  const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const canGoPrev = isAfter(viewMonth, startOfMonth(today));
  const canGoNext = isBefore(viewMonth, startOfMonth(maxDate));

  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(addDays(viewMonth, d - 1));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 w-full border border-gray-100 dark:border-gray-800 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={() => canGoPrev && setViewMonth((p) => addMonths(p, -1))}
          disabled={!canGoPrev}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          whileHover={canGoPrev ? { scale: 1.1 } : {}}
          whileTap={canGoPrev ? { scale: 0.9 } : {}}
          transition={spring}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.span
            key={format(viewMonth, 'MMM-yyyy')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold text-foreground"
          >
            {format(viewMonth, 'MMMM yyyy')}
          </motion.span>
        </AnimatePresence>

        <motion.button
          onClick={() => canGoNext && setViewMonth((p) => addMonths(p, 1))}
          disabled={!canGoNext}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          whileHover={canGoNext ? { scale: 1.1 } : {}}
          whileTap={canGoNext ? { scale: 0.9 } : {}}
          transition={spring}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-muted-foreground/60 py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`e-${idx}`} />;

          const isWeekend = getDay(date) === 0 || getDay(date) === 6;
          const isPast = isBefore(date, today);
          const isFutureTooFar = isAfter(date, maxDate);
          const isDisabled = isWeekend || isPast || isFutureTooFar;
          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, today);

          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => !isDisabled && onSelectDate(date)}
              disabled={isDisabled}
              className={`
                relative h-9 w-full rounded-xl text-xs font-medium transition-colors duration-150
                ${isDisabled ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : ''}
                ${!isSelected && isToday && !isDisabled ? 'border-2 border-primary text-primary font-bold' : ''}
                ${!isSelected && !isToday && !isDisabled ? 'bg-gray-50 dark:bg-gray-800 text-foreground hover:bg-primary/10 hover:text-primary border border-gray-100 dark:border-gray-700' : ''}
              `}
              whileHover={!isDisabled && !isSelected ? { scale: 1.08 } : {}}
              whileTap={!isDisabled ? { scale: 0.94 } : {}}
              animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
              transition={spring}
            >
              {format(date, 'd')}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected label */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={gentleSpring}
            className="mt-3 overflow-hidden"
          >
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <Check className="h-3 w-3" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// BOOKING MODAL
// ============================================================

function BookingModal({ onClose, onSuccess }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '',
    appointmentType: '', insurance: '', reason: '', consent: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedApt, setSubmittedApt] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    setFormData((p) => ({ ...p, date: dateStr, time: '' }));
    setBookedSlots(getBookedSlots(dateStr));
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
      id: generateId(),
      ...formData,
      status: 'Pending',
      adminMessage: '',
      createdAt: new Date().toISOString(),
    };
    const existing = getAppointments();
    existing.push(appointment);
    saveAppointments(existing);
    await sendEmail(appointment);
    setIsSubmitting(false);
    setSubmittedApt(appointment);
    setIsSuccess(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
      />
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
              Your appointment request has been submitted. We will confirm shortly.
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
                View Dashboard
              </Button>
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  setSubmittedApt(null);
                  setSelectedDate(null);
                  setFormData({ name: '', email: '', phone: '', date: '', time: '', appointmentType: '', insurance: '', reason: '', consent: false });
                }}
                variant="outline"
                className="rounded-full px-6"
              >
                Book Another
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Date & Time */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Select Date
                </h3>
                <CustomDatePicker selectedDate={selectedDate} onSelectDate={handleDateSelect} />
                <AnimatePresence>
                  {errors.date && (
                    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-2 flex items-center gap-1">
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
                        <Clock className="h-4 w-4 text-primary" />
                        Select Time
                      </h3>
                      <div className="grid grid-cols-4 gap-2">
                        {TIME_SLOTS.map((slot) => {
                          const isBooked = bookedSlots.includes(slot);
                          const isSelected = formData.time === slot;
                          return (
                            <motion.button
                              key={slot}
                              onClick={() => !isBooked && handleTimeSelect(slot)}
                              disabled={isBooked}
                              className={`
                                px-1 py-2 text-[11px] font-medium rounded-xl border transition-colors duration-150
                                ${isBooked ? 'bg-gray-50 dark:bg-gray-800 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed line-through' : ''}
                                ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md' : ''}
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
                          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-2 flex items-center gap-1">
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
                  <User className="h-4 w-4 text-primary" />
                  Patient Information
                </h3>
                <div>
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter your full name" className="mt-1 rounded-xl h-10" />
                  <AnimatePresence>
                    {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-1">{errors.name}</motion.p>}
                  </AnimatePresence>
                </div>
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
                <div>
                  <Label htmlFor="appointmentType" className="text-xs font-medium text-muted-foreground">Appointment Type *</Label>
                  <select id="appointmentType" value={formData.appointmentType} onChange={(e) => handleInputChange('appointmentType', e.target.value)} className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Select type...</option>
                    {APPOINTMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <AnimatePresence>
                    {errors.appointmentType && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-1">{errors.appointmentType}</motion.p>}
                  </AnimatePresence>
                </div>
                <div>
                  <Label htmlFor="insurance" className="text-xs font-medium text-muted-foreground">Insurance Provider (Optional)</Label>
                  <Input id="insurance" value={formData.insurance} onChange={(e) => handleInputChange('insurance', e.target.value)} placeholder="e.g., Blue Cross Blue Shield" className="mt-1 rounded-xl h-10" />
                </div>
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
                <div className="flex items-start gap-3 pt-1">
                  <Checkbox id="consent" checked={formData.consent} onCheckedChange={(checked) => handleInputChange('consent', checked === true)} className="mt-0.5" />
                  <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I consent to the collection and use of my personal information for scheduling. I understand this is a request subject to confirmation.
                  </label>
                </div>
                <AnimatePresence>
                  {errors.consent && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs text-rose-500">{errors.consent}</motion.p>}
                </AnimatePresence>
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

// ============================================================
// ADMIN DASHBOARD
// ============================================================

function AdminDashboard({ appointments, onUpdateStatus, onSendMessage, showToast }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [actionModal, setActionModal] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
      showToast('Welcome to Admin Dashboard', 'success');
    } else {
      setError('Incorrect password');
    }
  };

  const handleOpenActionModal = (apt, action) => {
    setActionModal({ apt, action });
    setActionMessage(
      action === 'accept'
        ? `Great news! Your appointment has been confirmed for ${apt.date} at ${apt.time}. We look forward to seeing you at our clinic. Please arrive 10 minutes early to complete any necessary paperwork.`
        : `Thank you for your interest in booking an appointment. Unfortunately, the requested time slot for ${apt.date} at ${apt.time} is no longer available. Please call us at ${DOCTOR.phone} to schedule an alternative time that works for you.`
    );
  };

  const handleConfirmAction = () => {
    if (!actionModal) return;
    const newStatus = actionModal.action === 'accept' ? 'Accepted' : 'Declined';
    onUpdateStatus(actionModal.apt.id, newStatus);
    if (actionMessage.trim()) onSendMessage(actionModal.apt.id, actionMessage);
    showToast(`Appointment ${newStatus.toLowerCase()} successfully`, actionModal.action === 'accept' ? 'success' : 'info');
    setActionModal(null);
    setActionMessage('');
  };

  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Date', 'Time', 'Type', 'Status', 'Created'].join(','),
      ...appointments.map((a) => [a.id, a.name, a.email, a.phone, a.date, a.time, a.appointmentType, a.status, new Date(a.createdAt).toLocaleString()].join(',')),
    ].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Appointments exported successfully', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={gentleSpring} className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl">
            <motion.div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6" whileHover={{ rotate: 10 }} transition={spring}>
              <Lock className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">Admin Access</h2>
            <p className="text-center text-muted-foreground mb-6 text-sm">Enter password to access dashboard</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                  className="mt-1 rounded-xl h-12"
                />
                <AnimatePresence>
                  {error && <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-rose-500 mt-2">{error}</motion.p>}
                </AnimatePresence>
              </div>
              <Button onClick={handleLogin} className="w-full rounded-xl h-12 text-base font-semibold">
                Login <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const filtered = appointments.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.phone.includes(q) || a.id.toLowerCase().includes(q)) &&
      (filterStatus === 'all' || a.status === filterStatus)
    );
  });

  const counts = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === 'Pending').length,
    accepted: appointments.filter((a) => a.status === 'Accepted').length,
    declined: appointments.filter((a) => a.status === 'Declined').length,
  };

  const statCards = [
    { label: 'Total', value: counts.total, Icon: CalendarDays, cls: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400' },
    { label: 'Pending', value: counts.pending, Icon: Clock, cls: 'from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-800/30 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400' },
    { label: 'Accepted', value: counts.accepted, Icon: CheckCircle, cls: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400' },
    { label: 'Declined', value: counts.declined, Icon: XCircle, cls: 'from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={gentleSpring}>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
              <p className="mt-1 text-muted-foreground text-sm">Manage all appointment requests</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" className="rounded-full px-5">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
              <Button onClick={() => setIsAuthenticated(false)} variant="outline" className="rounded-full px-5">
                <Lock className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {statCards.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, ...gentleSpring }}
                className={`bg-gradient-to-br ${s.cls} rounded-2xl border-2 p-5`}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-bold uppercase tracking-wider ${s.cls.split(' ').slice(-2).join(' ')}`}>{s.label}</p>
                  <s.Icon className={`h-4.5 w-4.5 ${s.cls.split(' ').slice(-2).join(' ')}`} />
                </div>
                <p className={`text-3xl font-extrabold ${s.cls.split(' ').slice(-2).join(' ')}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, phone, or ID…" className="pl-10 rounded-xl h-11" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex h-11 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
                  <Search className="h-9 w-9 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{searchTerm || filterStatus !== 'all' ? 'No matching appointments' : 'No Appointments Yet'}</h3>
                <p className="text-muted-foreground text-sm">{searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Appointments will appear here when patients book'}</p>
              </div>
            ) : (
              [...filtered].reverse().map((apt, idx) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, ...gentleSpring }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg transition-shadow duration-300"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        <Badge className="bg-primary/10 text-primary border-0 font-bold text-xs px-3 py-1">{apt.id}</Badge>
                        <Badge className={`rounded-full font-semibold text-xs px-3 py-1 ${apt.status === 'Pending' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : apt.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}`}>
                          {apt.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{new Date(apt.createdAt).toLocaleDateString()} at {new Date(apt.createdAt).toLocaleTimeString()}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Patient Details</p>
                          <div className="space-y-2">
                            {[
                              { Icon: User, val: apt.name },
                              { Icon: CalendarIcon, val: apt.email },
                              { Icon: Phone, val: apt.phone },
                            ].map(({ Icon, val }, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                <p className="text-xs text-foreground truncate">{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Appointment Info</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2"><Stethoscope className="h-3.5 w-3.5 text-primary" /><p className="text-xs font-semibold text-foreground">{apt.appointmentType}</p></div>
                            <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-primary" /><p className="text-xs text-muted-foreground">{apt.date} at {apt.time}</p></div>
                            {apt.insurance && <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary" /><p className="text-xs text-muted-foreground">{apt.insurance}</p></div>}
                          </div>
                        </div>
                      </div>

                      {apt.reason && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Reason</p>
                          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-900/50">
                            <p className="text-sm text-foreground">{apt.reason}</p>
                          </div>
                        </div>
                      )}

                      {apt.adminMessage && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Your Response</p>
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/50">
                            <p className="text-sm text-foreground">{apt.adminMessage}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-[200px]">
                      {apt.status === 'Pending' ? (
                        <>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
                            <Button onClick={() => handleOpenActionModal(apt, 'accept')} className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 h-10 text-sm">
                              <CheckCircle className="mr-2 h-4 w-4" /> Accept
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
                            <Button onClick={() => handleOpenActionModal(apt, 'decline')} variant="outline" className="w-full rounded-full border-rose-400 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-10 text-sm">
                              <XCircle className="mr-2 h-4 w-4" /> Decline
                            </Button>
                          </motion.div>
                        </>
                      ) : (
                        <div className="rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{apt.status === 'Accepted' ? 'Confirmed' : 'Declined'}</p>
                          {apt.status === 'Accepted' ? <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" /> : <XCircle className="h-8 w-8 text-rose-600 mx-auto" />}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Action Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={() => setActionModal(null)}
          >
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={gentleSpring}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className={`px-7 py-5 border-b ${actionModal.action === 'accept' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${actionModal.action === 'accept' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-rose-100 dark:bg-rose-900/50'}`}>
                      {actionModal.action === 'accept' ? <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" /> : <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{actionModal.action === 'accept' ? 'Accept Appointment' : 'Decline Appointment'}</h3>
                      <p className="text-xs text-muted-foreground">{actionModal.apt.name} — {actionModal.apt.date} at {actionModal.apt.time}</p>
                    </div>
                  </div>
                  <motion.button onClick={() => setActionModal(null)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/60 dark:hover:bg-gray-800/60" whileHover={{ scale: 1.1, rotate: 90 }} transition={spring}>
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              <div className="p-7 space-y-4">
                <div>
                  <Label htmlFor="actionMsg" className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Message to Patient
                  </Label>
                  <textarea
                    id="actionMsg"
                    value={actionMessage}
                    onChange={(e) => setActionMessage(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{actionMessage.length} characters</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} transition={spring}>
                    <Button
                      onClick={handleConfirmAction}
                      className={`w-full rounded-2xl h-11 font-bold ${actionModal.action === 'accept' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20' : 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20'}`}
                    >
                      <Send className="mr-2 h-4 w-4" /> Confirm & Send
                    </Button>
                  </motion.div>
                  <Button onClick={() => setActionModal(null)} variant="outline" className="flex-1 rounded-2xl h-11 font-semibold border-2">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// PATIENT DASHBOARD
// ============================================================

function DashboardView({ appointments, onCancel, onBook }) {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={gentleSpring}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">My Appointments</h1>
              <p className="mt-1 text-muted-foreground text-sm">
                {appointments.length > 0
                  ? `You have ${appointments.length} appointment${appointments.length > 1 ? 's' : ''}`
                  : 'No appointments scheduled yet'}
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring} className="hidden sm:block">
              <Button onClick={onBook} className="rounded-full px-5 h-10 text-sm font-medium">
                <CalendarDays className="mr-2 h-4 w-4" /> New
              </Button>
            </motion.div>
          </div>

          {appointments.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={gentleSpring} className="text-center py-20">
              <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">Schedule your first appointment with Dr. Shibli today.</p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Button onClick={onBook} className="rounded-full px-6">
                  Book Your First Appointment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {[...appointments].reverse().map((apt, idx) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, ...gentleSpring }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className="bg-primary/10 text-primary border-0 font-bold text-xs">{apt.id}</Badge>
                          <Badge className={`rounded-full text-xs font-semibold ${apt.status === 'Pending' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : apt.status === 'Accepted' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'}`}>
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-foreground">{apt.appointmentType}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{apt.date} at {apt.time}</p>
                        {apt.adminMessage && (
                          <div className={`mt-3 rounded-xl p-3 ${apt.status === 'Accepted' ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800' : apt.status === 'Declined' ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800' : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800'}`}>
                            <p className={`text-xs font-semibold mb-1 ${apt.status === 'Accepted' ? 'text-emerald-600 dark:text-emerald-400' : apt.status === 'Declined' ? 'text-rose-600 dark:text-rose-400' : 'text-blue-600 dark:text-blue-400'}`}>Message from clinic:</p>
                            <p className="text-sm text-foreground">{apt.adminMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {apt.status === 'Pending' && (
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
                        <Button onClick={() => onCancel(apt.id)} variant="ghost" size="sm" className="rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 self-end sm:self-center">
                          <Trash2 className="h-4 w-4 mr-1.5" /> Cancel
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <Button onClick={onBook} className="rounded-full w-full h-12 mt-6 text-sm font-medium sm:hidden">
            <CalendarDays className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// CONTACT SECTION
// ============================================================

function ContactSection({ onBook }) {
  return (
    <section id="contact" className="py-24 sm:py-32 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-14">
          <span className="text-sm font-semibold text-primary tracking-widest uppercase">Get In Touch</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Visit or Contact Us
          </h2>
          <p className="mt-4 text-muted-foreground max-w-md mx-auto text-sm">
            We&apos;re conveniently located in Mesquite and happy to answer any questions.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {[
              {
                Icon: Phone, label: 'Phone', value: DOCTOR.phone,
                href: `tel:${DOCTOR.phone.replace(/[^\d+]/g, '')}`,
                sub: 'Mon – Fri, 9AM – 5PM',
                color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
              },
              {
                Icon: Mail, label: 'Email', value: DOCTOR.email,
                href: `mailto:${DOCTOR.email}`,
                sub: 'We reply within 24 hours',
                color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
              },
              {
                Icon: MapPin, label: 'Address', value: DOCTOR.address,
                href: `https://maps.google.com/?q=${encodeURIComponent(DOCTOR.address)}`,
                sub: 'Get directions →',
                color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
              },
              {
                Icon: Clock, label: 'Hours', value: 'Mon – Fri: 9:00 AM – 5:00 PM',
                href: null,
                sub: 'Closed weekends & holidays',
                color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, ...gentleSpring }}
                whileHover={{ x: 4 }}
              >
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : undefined}
                    rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200 group"
                  >
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                  </a>
                ) : (
                  <div className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-foreground">{item.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Map + CTA */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            {/* Embedded map */}
            <Reveal className="flex-1">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm h-64 lg:h-full min-h-[260px]">
                <iframe
                  title="Clinic Location"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyD-placeholder&q=${encodeURIComponent(DOCTOR.address)}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '260px' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {/* Fallback if map doesn't load */}
                <div className="w-full h-full min-h-[260px] bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-800 dark:to-blue-900/20 flex flex-col items-center justify-center gap-4 -mt-[260px]">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-sm font-semibold text-foreground">{DOCTOR.address}</p>
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(DOCTOR.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline mt-1 inline-block"
                    >
                      Open in Google Maps →
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* Book CTA card */}
            <Reveal>
              <div className="bg-gradient-to-br from-primary to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.12),transparent_60%)]" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-100 mb-1">Ready to get started?</p>
                    <p className="text-xl font-bold">Book Your Appointment</p>
                    <p className="text-sm text-blue-200 mt-1">Online booking — takes under 2 minutes</p>
                  </div>
                  <motion.div whileHover={{ scale: 1.04, y: -2 }} whileTap={{ scale: 0.97 }} transition={spring} className="flex-shrink-0">
                    <Button
                      onClick={onBook}
                      className="bg-white text-primary hover:bg-blue-50 rounded-full px-6 h-11 text-sm font-bold shadow-lg shadow-black/20"
                    >
                      Book Now <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </motion.div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================

function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-primary origin-left z-[60] shadow-sm shadow-primary/30"
    />
  );
}

// ============================================================
// STICKY BOOK CTA
// ============================================================

function StickyBookCTA({ onBook, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={gentleSpring}
          className="fixed bottom-6 right-6 z-50 lg:hidden"
        >
          <motion.button
            onClick={onBook}
            className="flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-5 h-12 text-sm font-bold shadow-2xl shadow-primary/40"
            whileHover={{ scale: 1.06, y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
          >
            <CalendarDays className="h-4 w-4" />
            Book Now
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// FOOTER
// ============================================================

function FooterSection({ scrollToSection }) {
  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-white/8 flex items-center justify-center">
                <Heart className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-base font-semibold text-white">{DOCTOR.practice}</span>
            </div>
            <p className="text-sm leading-relaxed mb-5 text-gray-500">
              Providing compassionate, evidence-based healthcare for the Dallas-Mesquite community.
            </p>
            <div className="space-y-2">
              <a href={`tel:${DOCTOR.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> {DOCTOR.phone}
              </a>
              <a href={`mailto:${DOCTOR.email}`} className="flex items-center gap-2 text-sm hover:text-white transition-colors">
                <Mail className="h-4 w-4" /> {DOCTOR.email}
              </a>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" /> {DOCTOR.address}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Quick Links</h4>
            <div className="space-y-3">
              {[{ label: 'Home', id: 'hero' }, { label: 'Services', id: 'services' }, { label: 'About', id: 'about' }, { label: 'Contact', id: 'contact' }].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="block text-sm hover:text-white transition-colors"
                  whileHover={{ x: 4 }}
                  transition={spring}
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Office Hours</h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between"><span>Monday – Friday</span><span className="text-white font-medium">9:00 AM – 5:00 PM</span></p>
              <p className="flex justify-between"><span>Saturday</span><span>Closed</span></p>
              <p className="flex justify-between"><span>Sunday</span><span>Closed</span></p>
            </div>
            <div className="mt-5 p-3 rounded-xl bg-rose-950/40 border border-rose-900/30">
              <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> For medical emergencies, call 911
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} {DOCTOR.practice}. All rights reserved.</p>
          <p className="text-xs text-gray-600">Designed with care for better health.</p>
        </div>
      </div>
    </footer>
  );
}


// ============================================================
// MAIN APP
// ============================================================

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [showStickyBtn, setShowStickyBtn] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => { setAppointments(getAppointments()); }, []);

  useEffect(() => {
    const handler = () => {
      const y = window.scrollY;
      setScrolled(y > 20);
      setShowStickyBtn(y > 400);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = bookingOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [bookingOpen]);

  const showToast = useCallback((message, type = 'info') => setToast({ message, type }), []);

  const refreshAppointments = useCallback(() => setAppointments(getAppointments()), []);

  const handleBookingSuccess = useCallback(() => {
    refreshAppointments();
    setBookingOpen(false);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Appointment request submitted!', 'success');
  }, [refreshAppointments, showToast]);

  const cancelAppointment = useCallback((id) => {
    const updated = getAppointments().filter((a) => a.id !== id);
    saveAppointments(updated);
    setAppointments(updated);
    showToast('Appointment cancelled', 'info');
  }, [showToast]);

  const updateAppointmentStatus = useCallback((id, status) => {
    const updated = getAppointments().map((a) => a.id === id ? { ...a, status } : a);
    saveAppointments(updated);
    setAppointments(updated);
  }, []);

  const sendMessageToPatient = useCallback((id, message) => {
    const updated = getAppointments().map((a) => a.id === id ? { ...a, adminMessage: message } : a);
    saveAppointments(updated);
    setAppointments(updated);
  }, []);

  const scrollToSection = useCallback((sectionId) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }), 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-background">
      {/* Scroll progress bar — only on home */}
      {currentView === 'home' && <ScrollProgressBar />}

      <Header
        scrolled={scrolled}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onBook={() => setBookingOpen(true)}
        scrollToSection={scrollToSection}
        appointmentCount={appointments.length}
      />

      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <HeroSection onBook={() => setBookingOpen(true)} onViewServices={() => scrollToSection('services')} />
            <ServicesSection onBook={() => setBookingOpen(true)} />
            <AboutSection />
            <TrustSection />
            <ContactSection onBook={() => setBookingOpen(true)} />
          </motion.main>
        )}
        {currentView === 'dashboard' && (
          <motion.main key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <DashboardView appointments={appointments} onCancel={cancelAppointment} onBook={() => setBookingOpen(true)} />
          </motion.main>
        )}
        {currentView === 'admin' && (
          <motion.main key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <AdminDashboard appointments={appointments} onUpdateStatus={updateAppointmentStatus} onSendMessage={sendMessageToPatient} showToast={showToast} />
          </motion.main>
        )}
      </AnimatePresence>

      <FooterSection scrollToSection={scrollToSection} />

      {/* Sticky mobile Book button */}
      <StickyBookCTA onBook={() => setBookingOpen(true)} visible={showStickyBtn && currentView === 'home' && !bookingOpen} />

      <AnimatePresence>
        {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} onSuccess={handleBookingSuccess} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}