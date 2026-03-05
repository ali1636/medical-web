'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { z } from 'zod';
import { format, startOfDay, addMonths } from 'date-fns';
import { useTheme } from 'next-themes';
import {
  Stethoscope, FileText, Video, Shield, MapPin, Phone, Mail,
  Clock, Award, Star, ChevronRight, X, Check, AlertCircle,
  Sun, Moon, Menu, User, Trash2, Heart, Activity, Calendar as CalendarIcon,
  GraduationCap, BadgeCheck, CalendarDays, ArrowRight,
  Settings, Lock, CheckCircle, XCircle, MessageSquare, Send,
  Search, Download, Filter, Bell, TrendingUp, Globe, Languages
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

// ============================================================
// CONFIGURATION & CONSTANTS
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
  image: 'https://dims.healthgrades.com/dims3/MMH/0b1ebc4/2147483647/strip/true/crop/4749x7116+0+0/resize/4749x7116!/quality/75/?url=https%3A%2F%2Fucmscdn.healthgrades.com%2Fec%2F66%2F588039cf4a0690eab411337cd316%2Fy4q6x-urooj-shibli.jpg',
  bio: 'Dr. Urooj Shibli, MD is a board certified family medicine and obesity medicine specialist located in Texas. She has over 15 years of experience and has established a solid reputation for her pleasant disposition, ability to build a warm rapport with her patients, being a good listener and for providing clear, easy to follow diagnosis and treatment plans.',
  education: 'Ziauddin Medical University, 2004 (Gold Medal)',
  residency: 'Family Medicine Residency — Forbes / Allegheny Health Network, 2009',
  boardCert: 'American Board of Family Medicine (ABFM) & American Board of Obesity Medicine',
  awards: ['Gold Medal - Top Graduate', 'Best Geriatric Resident Award', 'Committed to Patient Care (3x)', 'On-Time Doctor Award (2018)'],
  languages: ['English', 'Urdu', 'Punjabi', 'Basic Spanish', 'Basic Hindi'],
  specialties: [
    'Family & Primary Care',
    'Obesity & Weight Loss',
    'Pediatrics & Adolescent Care',
    'Geriatric Care',
    "Women's Health & Gynecology",
    'Chronic Disease Management',
    'Telemedicine / Virtual Consults',
    'Cardiac Testing',
    'Preventive Screenings',
    'Wellness Counseling'
  ]
};

const SERVICES = [
  {
    name: 'General Consultation',
    duration: '30 Mins',
    price: '$100',
    description: 'Comprehensive health assessment with a personalized treatment plan tailored to your unique needs.',
    icon: 'stethoscope',
  },
  {
    name: 'Follow-up Visit',
    duration: '15 Mins',
    price: '$50',
    description: 'Review your progress and fine-tune your treatment plan for optimal health outcomes.',
    icon: 'filetext',
  },
  {
    name: 'Telehealth Call',
    duration: '20 Mins',
    price: '$80',
    description: 'Professional medical consultation from the comfort and privacy of your own home.',
    icon: 'video',
  },
  {
    name: 'Vaccination / Flu Shot',
    duration: '10 Mins',
    price: '$30',
    description: 'Stay protected with preventive immunizations administered by our experienced team.',
    icon: 'shield',
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

// ============================================================
// VALIDATION SCHEMA
// ============================================================

const appointmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number'),
  date: z.string().min(1, 'Please select a date'),
  time: z.string().min(1, 'Please select a time slot'),
  appointmentType: z.string().min(1, 'Please select an appointment type'),
  insurance: z.string().optional(),
  reason: z.string().max(300, 'Reason must be 300 characters or less').optional(),
  consent: z.literal(true, { errorMap: () => ({ message: 'You must consent to proceed' }) }),
});

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const STORAGE_KEY = 'shibli_appointments';

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
  const num = Math.floor(1000 + Math.random() * 9000);
  return `REQ-${num}`;
}

function getBookedSlots(dateStr) {
  return getAppointments()
    .filter((apt) => apt.date === dateStr && apt.status !== 'Cancelled')
    .map((apt) => apt.time);
}

async function sendEmail(data) {
  if (
    EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' ||
    EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' ||
    EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY'
  ) {
    console.info('%c EmailJS: Placeholder mode', 'color: #2563eb; font-weight: bold;');
    return { success: true, placeholder: true };
  }
  try {
    const emailjs = (await import('@emailjs/browser')).default;
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      patient_name: data.name,
      patient_email: data.email,
      patient_phone: data.phone,
      appointment_date: data.date,
      appointment_time: data.time,
      appointment_type: data.appointmentType,
      insurance: data.insurance || 'Not provided',
      reason: data.reason || 'Not specified',
      appointment_id: data.id,
    }, EMAILJS_PUBLIC_KEY);
    return { success: true };
  } catch (error) {
    console.error('EmailJS error:', error);
    return { success: false, error };
  }
}

// ============================================================
// TOAST NOTIFICATION COMPONENT
// ============================================================

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, y: -50, x: '-50%' }}
      className="fixed top-4 left-1/2 z-[100] max-w-md"
    >
      <div className={`rounded-2xl border-2 shadow-2xl px-6 py-4 flex items-center gap-3 ${
        type === 'success'
          ? 'bg-green-50 dark:bg-green-950/90 border-green-200 dark:border-green-800'
          : type === 'error'
          ? 'bg-red-50 dark:bg-red-950/90 border-red-200 dark:border-red-800'
          : 'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800'
      }`}>
        {type === 'success' && <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />}
        {type === 'error' && <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />}
        {type === 'info' && <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        <p className="text-sm font-semibold text-foreground">{message}</p>
        <button onClick={onClose} className="ml-auto">
          <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      </div>
    </motion.div>
  );
}

// ============================================================
// ANIMATION VARIANTS
// ============================================================

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

// ============================================================
// ICON HELPER
// ============================================================

function ServiceIcon({ type, className }) {
  const icons = { stethoscope: Stethoscope, filetext: FileText, video: Video, shield: Shield };
  const Icon = icons[type] || Stethoscope;
  return <Icon className={className} />;
}

// ============================================================
// HEADER COMPONENT
// ============================================================

function Header({ scrolled, currentView, setCurrentView, onBook, scrollToSection, appointmentCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/80 dark:bg-gray-950/80 backdrop-blur-2xl shadow-sm border-b border-gray-200/50 dark:border-gray-800/50' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Heart className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="hidden sm:block">
              <span className="text-base font-semibold tracking-tight text-foreground">Shibli Family Medicine</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {[{ label: 'Home', id: 'hero' }, { label: 'Services', id: 'services' }, { label: 'About', id: 'about' }].map((item) => (
              <button key={item.id} onClick={() => scrollToSection(item.id)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-all duration-200">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <button onClick={() => { setCurrentView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Admin">
              <Settings className="h-4 w-4" />
            </button>
            <button onClick={() => { setCurrentView('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <CalendarDays className="h-4 w-4" />
              <span>My Appointments</span>
              {appointmentCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 bg-primary text-primary-foreground text-[11px] font-bold rounded-full flex items-center justify-center">
                  {appointmentCount}
                </span>
              )}
            </button>
            <Button onClick={onBook} size="sm" className="rounded-full px-5 h-9 text-sm font-medium shadow-none">
              Book Appointment
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {mounted && (
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            )}
            <button className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="px-4 py-3 space-y-1">
              {[{ label: 'Home', id: 'hero' }, { label: 'Services', id: 'services' }, { label: 'About', id: 'about' }].map((item) => (
                <button key={item.id} onClick={() => { scrollToSection(item.id); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  {item.label}
                </button>
              ))}
              <button onClick={() => { setCurrentView('admin'); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                Admin Dashboard
              </button>
              <button onClick={() => { setCurrentView('dashboard'); setMobileOpen(false); }} className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                My Appointments {appointmentCount > 0 && `(${appointmentCount})`}
              </button>
              <div className="px-4 pt-2 pb-1">
                <Button onClick={() => { onBook(); setMobileOpen(false); }} className="w-full rounded-full h-10 text-sm font-medium">
                  Book Appointment
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// ============================================================
// HERO SECTION
// ============================================================

function HeroSection({ onBook, onViewServices }) {
  const [imgError, setImgError] = useState(false);
  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20" />
      <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-100/30 dark:bg-blue-900/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100/20 dark:bg-indigo-900/10 rounded-full blur-3xl" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BadgeCheck className="h-4 w-4" />
              Board Certified Family Medicine
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-foreground leading-[1.08] mb-6">
              Expert Care <span className="text-primary">You Can Trust.</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              {DOCTOR.name}, {DOCTOR.credentials}. Providing compassionate, patient-centered healthcare for over {DOCTOR.experience} years in the Dallas-Mesquite area.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-12">
              <Button onClick={onBook} size="lg" className="rounded-full px-8 h-12 text-base font-medium shadow-lg shadow-primary/25">
                Book Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={onViewServices} variant="outline" size="lg" className="rounded-full px-8 h-12 text-base font-medium">
                View Services
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
              {[
                { icon: Award, label: `${DOCTOR.experience} Years Experience` },
                { icon: BadgeCheck, label: 'ABFM Certified' },
                { icon: Heart, label: 'Patient-Centered' },
              ].map((badge, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.1 }} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="h-4 w-4 text-primary/70" />
                  <span>{badge.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative flex justify-center lg:justify-end">
            <div className="relative">
              <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-br from-blue-100/60 to-indigo-100/40 dark:from-blue-900/20 dark:to-indigo-900/10 rounded-[2rem] sm:rounded-[2.5rem] rotate-2" />
              <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 max-w-md lg:max-w-lg">
                {!imgError ? (
                  <img src={DOCTOR.image} alt={`${DOCTOR.name} - Family Physician`} className="w-full h-auto object-cover aspect-[3/4]" onError={() => setImgError(true)} />
                ) : (
                  <div className="w-full aspect-[3/4] bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
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
              <div className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-4 border border-gray-100 dark:border-gray-800 max-w-[280px]">
                <div className="flex items-center gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-green-200 dark:border-green-800">
                      <img
                        src="https://dims.healthgrades.com/dims3/MMH/0b1ebc4/2147483647/strip/true/crop/4749x7116+0+0/resize/4749x7116!/quality/75/?url=https%3A%2F%2Fucmscdn.healthgrades.com%2Fec%2F66%2F588039cf4a0690eab411337cd316%2Fy4q6x-urooj-shibli.jpg"
                        alt="Dr. Urooj Shibli"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = DOCTOR.image; }}
                      />
                    </div>
                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center border-2 border-white dark:border-gray-900">
                      <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Accepting New Patients</p>
                    <p className="text-xs text-muted-foreground">Mon - Fri, 9AM - 5PM</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ============================================================
// SERVICES SECTION
// ============================================================

function ServicesSection({ onBook }) {
  return (
    <section id="services" className="py-24 sm:py-32 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-sm font-medium text-primary tracking-wide uppercase">Our Services</span>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">Comprehensive Care</h2>
        </motion.div>
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, index) => (
            <motion.div key={index} variants={fadeInUp}>
              <div className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 h-full flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <ServiceIcon type={service.icon} className="h-6 w-6 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 border-0">
                    {service.duration}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{service.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">{service.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-foreground">{service.price}</span>
                  <Button onClick={onBook} variant="ghost" size="sm" className="rounded-full text-primary hover:bg-primary/10 font-medium text-sm px-4">
                    Book Now
                    <ChevronRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// ABOUT SECTION (ENHANCED WITH COMPREHENSIVE INFO)
// ============================================================

function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main About */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg">
                <img src="https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=600&h=700&fit=crop&crop=top" alt="Healthcare" className="w-full h-auto object-cover aspect-[4/5]" />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">Highly Rated</span>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="text-sm font-medium text-primary tracking-wide uppercase">About {DOCTOR.name}</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Your Partner in Health & Wellness</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed text-base">{DOCTOR.bio}</p>
            <p className="mt-4 text-muted-foreground leading-relaxed text-base">
              Dr Shibli has established a solid reputation and is well known for her pleasant disposition, ability to build a warm rapport with her patients, being a good listener and for providing clear, easy to follow diagnosis and treatment plans.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed text-base">
              She has recently established her own private practice and is accepting both old and new patients. At Shibli Family Medicine and Obesity Clinic, we are committed to providing you with the most exceptional care in a compassionate and friendly atmosphere.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: GraduationCap, label: 'Education', value: DOCTOR.education },
                { icon: Activity, label: 'Residency', value: DOCTOR.residency },
                { icon: BadgeCheck, label: 'Board Certifications', value: DOCTOR.boardCert },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{item.label}</p>
                    <p className="text-sm font-medium text-foreground">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Education Timeline */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20">
          <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Education & Training Timeline</h3>
          <p className="text-muted-foreground text-center mb-10">Dr. Shibli's medical education and professional journey</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 p-6">
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-4">
                <GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2">2004 — MEDICAL SCHOOL</p>
              <p className="text-lg font-bold text-foreground mb-1">Ziauddin Medical University</p>
              <p className="text-sm text-muted-foreground">Graduated with Gold Medal — Karachi, Pakistan</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl border-2 border-purple-100 dark:border-purple-900/50 p-6">
              <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2">2007 — INTERNSHIP</p>
              <p className="text-lg font-bold text-foreground mb-1">General Internship</p>
              <p className="text-sm text-muted-foreground">Forbes Regional Hospital, PA</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border-2 border-green-100 dark:border-green-900/50 p-6">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center mb-4">
                <BadgeCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-bold text-green-600 dark:text-green-400 mb-2">2009 — RESIDENCY</p>
              <p className="text-lg font-bold text-foreground mb-1">Family Medicine Residency</p>
              <p className="text-sm text-muted-foreground">Forbes / Allegheny Health Network</p>
            </div>
          </div>
        </motion.div>

        {/* Professional Experience */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-20 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-3xl border-2 border-amber-100 dark:border-amber-900/50 p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
              <Heart className="h-7 w-7 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-foreground">Professional Experience</h3>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Clinical leadership & practice ownership</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-3xl font-extrabold text-primary mb-2">15–20+ years</p>
              <p className="text-sm text-muted-foreground">Primary care, preventive medicine & weight management expertise</p>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground mb-2">Founder & Lead Physician</p>
              <p className="text-sm text-muted-foreground">Shibli Family Medicine & Obesity Clinic — Mesquite, TX</p>
            </div>
          </div>
        </motion.div>

        {/* Awards & Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Awards & Recognitions
            </h3>
            <div className="space-y-3">
              {DOCTOR.awards.map((award, i) => (
                <div key={i} className="flex items-start gap-3 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                  <div className="h-8 w-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{award}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-primary" />
              Languages Spoken
            </h3>
            <p className="text-sm text-muted-foreground mb-4">Care available in multiple languages</p>
            <div className="flex flex-wrap gap-2">
              {DOCTOR.languages.map((lang, i) => (
                <Badge key={i} variant="secondary" className="rounded-full text-sm font-medium px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  <Globe className="h-3.5 w-3.5 mr-1.5" />
                  {lang}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Specialties */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Specialties & Services</h3>
          <p className="text-muted-foreground text-center mb-10">Comprehensive clinic services for all ages</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {DOCTOR.specialties.map((specialty, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-100 dark:border-gray-800 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Stethoscope className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-semibold text-foreground">{specialty}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================
// TRUST SECTION
// ============================================================

function TrustSection() {
  const stats = [
    { value: '15+', label: 'Years of Experience' },
    { value: '10K+', label: 'Patients Served' },
    { value: 'ABFM', label: 'Board Certified' },
    { value: '4.8', label: 'Patient Rating' },
  ];
  return (
    <section className="py-20 bg-gray-50/50 dark:bg-gray-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div key={i} variants={fadeInUp} className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-primary">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
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
    if (!date) return;
    setSelectedDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    setFormData((prev) => ({ ...prev, date: dateStr, time: '' }));
    setBookedSlots(getBookedSlots(dateStr));
    setErrors((prev) => ({ ...prev, date: undefined, time: undefined }));
  };

  const handleTimeSelect = (time) => {
    setFormData((prev) => ({ ...prev, time }));
    setErrors((prev) => ({ ...prev, time: undefined }));
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const result = appointmentSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0];
        if (!fieldErrors[field]) fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

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

  const disabledDays = [
    { before: startOfDay(new Date()) },
    { dayOfWeek: [0, 6] },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl bg-white dark:bg-gray-950 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 className="text-xl font-bold text-foreground">{isSuccess ? 'Appointment Confirmed' : 'Book Your Appointment'}</h2>
            {!isSuccess && <p className="text-sm text-muted-foreground mt-0.5">Select your preferred date, time, and fill in your details.</p>}
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isSuccess ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="px-6 py-12 text-center">
            <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </motion.div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Request Submitted Successfully!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Your appointment request has been submitted. We will confirm shortly.</p>
            {submittedApt && (
              <div className="inline-flex flex-col items-center gap-3 bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 mb-8">
                <Badge className="bg-primary/10 text-primary border-0 text-base font-bold px-4 py-1">{submittedApt.id}</Badge>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>{submittedApt.date} at {submittedApt.time}</p>
                  <p>{submittedApt.appointmentType}</p>
                  <Badge variant="secondary" className="mt-2 rounded-full">{submittedApt.status}</Badge>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => { onSuccess(); }} className="rounded-full px-6">
                <CalendarDays className="mr-2 h-4 w-4" />
                View Dashboard
              </Button>
              <Button onClick={() => { setIsSuccess(false); setSubmittedApt(null); setSelectedDate(null); setFormData({ name: '', email: '', phone: '', date: '', time: '', appointmentType: '', insurance: '', reason: '', consent: false }); }} variant="outline" className="rounded-full px-6">
                Book Another
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  Select Date
                </h3>
                <div className="flex justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={disabledDays}
                    fromDate={new Date()}
                    toDate={addMonths(new Date(), 3)}
                    className="rounded-xl"
                  />
                </div>
                {errors.date && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> {errors.date}
                  </motion.p>
                )}

                {formData.date && (
                  <div className="mt-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      Select Time
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = formData.time === slot;
                        return (
                          <button key={slot} onClick={() => !isBooked && handleTimeSelect(slot)} disabled={isBooked} className={`px-2 py-2 text-xs font-medium rounded-xl border transition-all duration-200 ${isBooked ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-gray-100 cursor-not-allowed line-through' : isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md' : 'bg-white dark:bg-gray-900 text-foreground border-gray-200 dark:border-gray-700 hover:border-primary'}`}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {errors.time && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" /> {errors.time}
                      </motion.p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Patient Information
                </h3>
                <div>
                  <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="Enter your full name" className="mt-1 rounded-xl h-10" />
                  {errors.name && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">{errors.name}</motion.p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email *</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="you@example.com" className="mt-1 rounded-xl h-10" />
                    {errors.email && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">{errors.email}</motion.p>}
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-xs font-medium text-muted-foreground">Phone *</Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} placeholder="(469) 555-0123" className="mt-1 rounded-xl h-10" />
                    {errors.phone && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">{errors.phone}</motion.p>}
                  </div>
                </div>
                <div>
                  <Label htmlFor="appointmentType" className="text-xs font-medium text-muted-foreground">Appointment Type *</Label>
                  <select id="appointmentType" value={formData.appointmentType} onChange={(e) => handleInputChange('appointmentType', e.target.value)} className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select type...</option>
                    {APPOINTMENT_TYPES.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.appointmentType && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">{errors.appointmentType}</motion.p>}
                </div>
                <div>
                  <Label htmlFor="insurance" className="text-xs font-medium text-muted-foreground">Insurance Provider (Optional)</Label>
                  <Input id="insurance" value={formData.insurance} onChange={(e) => handleInputChange('insurance', e.target.value)} placeholder="e.g., Blue Cross" className="mt-1 rounded-xl h-10" />
                </div>
                <div>
                  <Label htmlFor="reason" className="text-xs font-medium text-muted-foreground">
                    Reason for Visit (Optional)
                    <span className="ml-2">({formData.reason?.length || 0}/300)</span>
                  </Label>
                  <textarea id="reason" value={formData.reason || ''} onChange={(e) => { if (e.target.value.length <= 300) handleInputChange('reason', e.target.value); }} placeholder="Briefly describe..." rows={3} className="mt-1 flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
                  {errors.reason && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500 mt-1">{errors.reason}</motion.p>}
                </div>
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox id="consent" checked={formData.consent} onCheckedChange={(checked) => handleInputChange('consent', checked === true)} className="mt-0.5" />
                  <label htmlFor="consent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    I consent to the collection and use of my personal information for scheduling. I understand this is a request subject to confirmation.
                  </label>
                </div>
                {errors.consent && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500">{errors.consent}</motion.p>}
                <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full rounded-xl h-11 text-sm font-semibold mt-2 shadow-lg">
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Submitting...
                    </div>
                  ) : (
                    <>
                      Submit Appointment Request
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
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
    if (action === 'accept') {
      setActionMessage(`Great news! Your appointment has been confirmed for ${apt.date} at ${apt.time}. We look forward to seeing you at our clinic. Please arrive 10 minutes early to complete any necessary paperwork.`);
    } else {
      setActionMessage(`Thank you for your interest in booking an appointment. Unfortunately, the requested time slot for ${apt.date} at ${apt.time} is no longer available. Please call us at ${DOCTOR.phone} to schedule an alternative time that works for you.`);
    }
  };

  const handleConfirmAction = () => {
    if (actionModal) {
      const newStatus = actionModal.action === 'accept' ? 'Accepted' : 'Declined';
      onUpdateStatus(actionModal.apt.id, newStatus);
      if (actionMessage.trim()) {
        onSendMessage(actionModal.apt.id, actionMessage);
      }
      showToast(
        `Appointment ${newStatus.toLowerCase()} successfully`,
        actionModal.action === 'accept' ? 'success' : 'info'
      );
      setActionModal(null);
      setActionMessage('');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Name', 'Email', 'Phone', 'Date', 'Time', 'Type', 'Status', 'Created'].join(','),
      ...appointments.map(apt => [
        apt.id,
        apt.name,
        apt.email,
        apt.phone,
        apt.date,
        apt.time,
        apt.appointmentType,
        apt.status,
        new Date(apt.createdAt).toLocaleString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Appointments exported successfully', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-100 dark:border-gray-800 p-8 shadow-xl">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">Admin Access</h2>
            <p className="text-center text-muted-foreground mb-6">Enter password to access dashboard</p>
            <div className="space-y-4">
              <div>
                <Label htmlFor="adminPassword">Password</Label>
                <Input id="adminPassword" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} placeholder="Enter admin password" className="mt-1 rounded-xl h-12" />
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              </div>
              <Button onClick={handleLogin} className="w-full rounded-xl h-12 text-base font-semibold">
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">Default password: admin123</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone.includes(searchTerm) ||
      apt.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = appointments.filter(a => a.status === 'Pending').length;
  const acceptedCount = appointments.filter(a => a.status === 'Accepted').length;
  const declinedCount = appointments.filter(a => a.status === 'Declined').length;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Manage all appointment requests</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleExport} variant="outline" className="rounded-full px-5">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button onClick={() => setIsAuthenticated(false)} variant="outline" className="rounded-full px-5">
                <Lock className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Total Requests</p>
                <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-4xl font-extrabold text-blue-700 dark:text-blue-300">{appointments.length}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-amber-100 dark:border-amber-900/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Pending</p>
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-4xl font-extrabold text-amber-700 dark:text-amber-300">{pendingCount}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl border-2 border-green-100 dark:border-green-900/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">Accepted</p>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-4xl font-extrabold text-green-700 dark:text-green-300">{acceptedCount}</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 rounded-2xl border-2 border-red-100 dark:border-red-900/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold text-red-600 dark:text-red-400">Declined</p>
                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-4xl font-extrabold text-red-700 dark:text-red-300">{declinedCount}</p>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, or ID..."
                className="pl-10 rounded-xl h-11"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-11 rounded-xl border border-input bg-background px-4 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Appointments List */}
          <div className="space-y-4">
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                  {searchTerm || filterStatus !== 'all' ? (
                    <Search className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                  ) : (
                    <CalendarDays className="h-10 w-10 text-gray-300 dark:text-gray-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No matching appointments' : 'No Appointments Yet'}
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Appointments will appear here when patients book'}
                </p>
              </div>
            ) : (
              [...filteredAppointments].reverse().map((apt, index) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        <Badge className="bg-primary/10 text-primary border-0 font-bold text-sm px-4 py-1.5">{apt.id}</Badge>
                        <Badge className={`rounded-full font-bold text-sm px-4 py-1.5 ${apt.status === 'Pending' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800' : apt.status === 'Accepted' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400 border-2 border-green-200 dark:border-green-800' : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400 border-2 border-red-200 dark:border-red-800'}`}>
                          {apt.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(apt.createdAt).toLocaleDateString()} at {new Date(apt.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Patient Details</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-primary" />
                              <p className="text-sm font-semibold text-foreground">{apt.name}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{apt.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{apt.phone}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Appointment Info</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-primary" />
                              <p className="text-sm font-semibold text-foreground">{apt.appointmentType}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{apt.date} at {apt.time}</p>
                            </div>
                            {apt.insurance && (
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-primary" />
                                <p className="text-xs text-muted-foreground">{apt.insurance}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {apt.reason && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Reason for Visit</p>
                          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl p-4 border-2 border-blue-100 dark:border-blue-900/50">
                            <p className="text-sm text-foreground leading-relaxed">{apt.reason}</p>
                          </div>
                        </div>
                      )}

                      {apt.adminMessage && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Your Response
                          </p>
                          <div className="bg-green-50 dark:bg-green-950/30 rounded-2xl p-4 border-2 border-green-100 dark:border-green-900/50">
                            <p className="text-sm text-foreground leading-relaxed">{apt.adminMessage}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:min-w-[220px]">
                      {apt.status === 'Pending' ? (
                        <>
                          <Button onClick={() => handleOpenActionModal(apt, 'accept')} className="rounded-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-lg shadow-green-500/30 h-11">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Accept & Reply
                          </Button>
                          <Button onClick={() => handleOpenActionModal(apt, 'decline')} variant="outline" className="rounded-full border-2 text-red-600 border-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-11">
                            <XCircle className="mr-2 h-4 w-4" />
                            Decline & Reply
                          </Button>
                        </>
                      ) : (
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 border-2 border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                            {apt.status === 'Accepted' ? 'Confirmed' : 'Declined'}
                          </p>
                          <div className="flex items-center justify-center">
                            {apt.status === 'Accepted' ? (
                              <CheckCircle className="h-8 w-8 text-green-600" />
                            ) : (
                              <XCircle className="h-8 w-8 text-red-600" />
                            )}
                          </div>
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

      {/* Accept/Decline Modal */}
      <AnimatePresence>
        {actionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setActionModal(null)}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="relative w-full max-w-2xl bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden">
              <div className={`px-8 py-6 border-b-2 ${actionModal.action === 'accept' ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-900' : 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${actionModal.action === 'accept' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                      {actionModal.action === 'accept' ? (
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      ) : (
                        <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">
                        {actionModal.action === 'accept' ? 'Accept Appointment' : 'Decline Appointment'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {actionModal.apt.name} - {actionModal.apt.date} at {actionModal.apt.time}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setActionModal(null)} className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-8">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="actionMessage" className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      Message to Patient {actionModal.action === 'accept' ? '(Confirmation)' : '(Reason)'}
                    </Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      {actionModal.action === 'accept' ? 'This message will be sent to confirm their appointment.' : 'Please provide a reason or alternative options.'}
                    </p>
                    <textarea id="actionMessage" value={actionMessage} onChange={(e) => setActionMessage(e.target.value)} placeholder={actionModal.action === 'accept' ? "Your appointment has been confirmed..." : "Unfortunately, we cannot accommodate your request..."} rows={6} className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" />
                    <p className="text-xs text-muted-foreground mt-2">{actionMessage.length} characters</p>
                  </div>

                  <div className={`rounded-2xl p-4 border-2 ${actionModal.action === 'accept' ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'}`}>
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      <AlertCircle className="h-3.5 w-3.5" />
                      What happens next?
                    </p>
                    <ul className="text-xs space-y-1.5 text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">1.</span>
                        <span>Status will be updated to <strong>{actionModal.action === 'accept' ? 'Accepted' : 'Declined'}</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">2.</span>
                        <span>Patient will see your message in their dashboard</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary font-bold">3.</span>
                        <span>{actionModal.action === 'accept' ? 'They can view confirmed appointment details' : 'They can book a new appointment if needed'}</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  <Button onClick={handleConfirmAction} className={`flex-1 rounded-2xl h-12 text-base font-bold shadow-lg ${actionModal.action === 'accept' ? 'bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 shadow-green-500/30' : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-red-500/30'}`}>
                    <Send className="mr-2 h-5 w-5" />
                    Confirm & Send Message
                  </Button>
                  <Button onClick={() => setActionModal(null)} variant="outline" className="flex-1 rounded-2xl h-12 text-base font-bold border-2">
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
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">My Appointments</h1>
              <p className="mt-1 text-muted-foreground">
                {appointments.length > 0 ? `You have ${appointments.length} appointment${appointments.length > 1 ? 's' : ''}` : 'No appointments scheduled yet'}
              </p>
            </div>
            <Button onClick={onBook} className="rounded-full px-5 h-10 text-sm font-medium hidden sm:flex">
              <CalendarDays className="mr-2 h-4 w-4" />
              New Appointment
            </Button>
          </div>
          {appointments.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
              <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Schedule your first appointment</p>
              <Button onClick={onBook} className="rounded-full px-6">
                Book Your First Appointment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {[...appointments].reverse().map((apt) => (
                <motion.div key={apt.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className="bg-primary/10 text-primary border-0 font-bold text-xs">{apt.id}</Badge>
                          <Badge className={`rounded-full text-xs font-medium ${apt.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' : apt.status === 'Accepted' ? 'bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'}`}>
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-foreground">{apt.appointmentType}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{apt.date} at {apt.time}</p>
                        {apt.adminMessage && (
                          <div className={`mt-3 rounded-lg p-3 ${apt.status === 'Accepted' ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800' : apt.status === 'Declined' ? 'bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800' : 'bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-200 dark:border-blue-800'}`}>
                            <p className={`text-xs font-medium mb-1 ${apt.status === 'Accepted' ? 'text-green-600 dark:text-green-400' : apt.status === 'Declined' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>Message from clinic:</p>
                            <p className="text-sm text-foreground">{apt.adminMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {apt.status === 'Pending' && (
                      <Button onClick={() => onCancel(apt.id)} variant="ghost" size="sm" className="rounded-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 self-end sm:self-center">
                        <Trash2 className="h-4 w-4 mr-1.5" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <Button onClick={onBook} className="rounded-full w-full h-12 mt-6 text-sm font-medium sm:hidden">
            <CalendarDays className="mr-2 h-4 w-4" />
            New Appointment
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

// ============================================================
// FOOTER
// ============================================================

function FooterSection({ scrollToSection }) {
  return (
    <footer className="bg-gray-950 text-gray-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Heart className="h-4.5 w-4.5 text-blue-400" />
              </div>
              <span className="text-base font-semibold text-white">{DOCTOR.practice}</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">Providing compassionate healthcare for the Dallas-Mesquite community.</p>
            <div className="space-y-2">
              <a href={`tel:${DOCTOR.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> {DOCTOR.phone}
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <MapPin className="h-4 w-4 flex-shrink-0" /> {DOCTOR.address}
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="space-y-2">
              {[{ label: 'Home', id: 'hero' }, { label: 'Services', id: 'services' }, { label: 'About', id: 'about' }].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} className="block text-sm text-gray-400 hover:text-white transition-colors">
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Office Hours</h4>
            <div className="space-y-2 text-sm text-gray-400">
              <p className="flex justify-between"><span>Monday - Friday</span><span className="text-white">9:00 AM - 5:00 PM</span></p>
              <p className="flex justify-between"><span>Saturday</span><span>Closed</span></p>
              <p className="flex justify-between"><span>Sunday</span><span>Closed</span></p>
            </div>
            <div className="mt-6 p-3 rounded-xl bg-red-950/30 border border-red-900/30">
              <p className="text-xs text-red-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                For medical emergencies, call 911
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} {DOCTOR.practice}. All rights reserved.</p>
          <p className="text-xs text-gray-500">Designed with care for better health.</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [bookingOpen, setBookingOpen] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setAppointments(getAppointments());
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (bookingOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [bookingOpen]);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const refreshAppointments = useCallback(() => {
    setAppointments(getAppointments());
  }, []);

  const handleBookingSuccess = useCallback(() => {
    refreshAppointments();
    setBookingOpen(false);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Appointment request submitted successfully!', 'success');
  }, [refreshAppointments, showToast]);

  const cancelAppointment = useCallback((id) => {
    const updated = getAppointments().filter((apt) => apt.id !== id);
    saveAppointments(updated);
    setAppointments(updated);
    showToast('Appointment cancelled successfully', 'info');
  }, [showToast]);

  const updateAppointmentStatus = useCallback((id, newStatus) => {
    const updated = getAppointments().map((apt) =>
      apt.id === id ? { ...apt, status: newStatus } : apt
    );
    saveAppointments(updated);
    setAppointments(updated);
  }, []);

  const sendMessageToPatient = useCallback((id, message) => {
    const updated = getAppointments().map((apt) =>
      apt.id === id ? { ...apt, adminMessage: message } : apt
    );
    saveAppointments(updated);
    setAppointments(updated);
  }, []);

  const scrollToSection = (sectionId) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <Header scrolled={scrolled} currentView={currentView} setCurrentView={setCurrentView} onBook={() => setBookingOpen(true)} scrollToSection={scrollToSection} appointmentCount={appointments.length} />

      <AnimatePresence mode="wait">
        {currentView === 'home' ? (
          <motion.main key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HeroSection onBook={() => setBookingOpen(true)} onViewServices={() => scrollToSection('services')} />
            <ServicesSection onBook={() => setBookingOpen(true)} />
            <AboutSection />
            <TrustSection />
          </motion.main>
        ) : currentView === 'dashboard' ? (
          <motion.main key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DashboardView appointments={appointments} onCancel={cancelAppointment} onBook={() => setBookingOpen(true)} />
          </motion.main>
        ) : (
          <motion.main key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AdminDashboard appointments={appointments} onUpdateStatus={updateAppointmentStatus} onSendMessage={sendMessageToPatient} showToast={showToast} />
          </motion.main>
        )}
      </AnimatePresence>

      <FooterSection scrollToSection={scrollToSection} />

      <AnimatePresence>
        {bookingOpen && (
          <BookingModal onClose={() => setBookingOpen(false)} onSuccess={handleBookingSuccess} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}