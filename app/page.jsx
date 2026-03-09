// app/page.jsx
// ── Entry point — thin orchestration layer ──────────────────────
// All business logic lives in hooks/. All UI in components/.
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header }           from '@/components/layout/Header';
import { Footer }           from '@/components/layout/Footer';
import { ScrollProgressBar }from '@/components/layout/ScrollProgressBar';
import { HeroSection }      from '@/components/sections/HeroSection';
import { ServicesSection }  from '@/components/sections/ServicesSection';
import { AboutSection }     from '@/components/sections/AboutSection';
import { TrustSection }     from '@/components/sections/TrustSection';
import { ContactSection }   from '@/components/sections/ContactSection';
import { BookingModal }     from '@/components/booking/BookingModal';
import { StickyBookCTA }    from '@/components/booking/StickyBookCTA';
import { PatientDashboard } from '@/components/dashboard/PatientDashboard';
import { AdminDashboard }   from '@/components/dashboard/AdminDashboard';
import { Toast }            from '@/components/ui/Toast';
import { useToast }         from '@/hooks/useToast';
import { useAppointments }  from '@/hooks/useAppointments';

export default function App() {
  const [currentView,   setCurrentView]   = useState('home');
  const [bookingOpen,   setBookingOpen]   = useState(false);
  const [scrolled,      setScrolled]      = useState(false);
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  const { toast, showToast, clearToast } = useToast();

  const {
    appointments,
    cancelAppointment,
    refreshLocalAppointments,
    refreshAdminAppointments,
  } = useAppointments(showToast);

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

  const handleBookingSuccess = useCallback(() => {
    refreshLocalAppointments();
    setBookingOpen(false);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Appointment submitted! Check your email for confirmation.', 'success');
  }, [refreshLocalAppointments, showToast]);

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
            <PatientDashboard appointments={appointments} onCancel={cancelAppointment} onBook={() => setBookingOpen(true)} />
          </motion.main>
        )}
        {currentView === 'admin' && (
          <motion.main key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <AdminDashboard appointments={appointments} onRefresh={refreshAdminAppointments} showToast={showToast} />
          </motion.main>
        )}
      </AnimatePresence>

      <Footer scrollToSection={scrollToSection} />

      <StickyBookCTA onBook={() => setBookingOpen(true)} visible={showStickyBtn && currentView === 'home' && !bookingOpen} />

      <AnimatePresence>
        {bookingOpen && <BookingModal onClose={() => setBookingOpen(false)} onSuccess={handleBookingSuccess} allAppointments={appointments} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
      </AnimatePresence>
    </div>
  );
}