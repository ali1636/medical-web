// components/layout/Header.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import {
  Heart, Sun, Moon, Menu, X, Settings,
  CalendarDays, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { spring, stagger, fadeUp } from '@/lib/animations';

/**
 * Header — sticky nav with dark-mode toggle, mobile menu,
 * appointment count badge, admin access, and book button.
 */
export function Header({ scrolled, currentView, setCurrentView, onBook, scrollToSection, appointmentCount }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const NAV_LINKS = [
    { label: 'Home',     id: 'hero' },
    { label: 'Services', id: 'services' },
    { label: 'About',    id: 'about' },
    { label: 'Contact',  id: 'contact' },
  ];

  return (
    <motion.header
      initial={false}
      animate={
        scrolled
          ? { backgroundColor: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(24px)' }
          : { backgroundColor: 'rgba(255,255,255,0)',    backdropFilter: 'blur(0px)' }
      }
      transition={{ duration: 0.3 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 dark:!bg-gray-950/80 ${
        scrolled ? 'shadow-sm border-b border-gray-200/50 dark:border-gray-800/50' : ''
      }`}
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
            {NAV_LINKS.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
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
            {/* Dark Mode Toggle */}
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
                  <motion.div
                    key={resolvedTheme}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    {resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            )}

            {/* Admin Button */}
            <motion.button
              onClick={() => { setCurrentView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              transition={spring}
              title="Admin Dashboard"
            >
              <Settings className="h-4 w-4" />
            </motion.button>

            {/* My Appointments with badge */}
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

            {/* Book Button */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
              <Button onClick={onBook} size="sm" className="rounded-full px-5 h-9 text-sm font-medium shadow-none">
                Book Appointment
              </Button>
            </motion.div>
          </div>

          {/* Mobile Controls */}
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
                <motion.div
                  key={mobileOpen ? 'close' : 'open'}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.15 }}
                >
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
            <motion.div initial="hidden" animate="visible" variants={stagger} className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((item) => (
                <motion.button
                  key={item.id}
                  variants={fadeUp}
                  onClick={() => { scrollToSection(item.id); setMobileOpen(false); }}
                  className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {item.label}
                </motion.button>
              ))}
              <motion.button
                variants={fadeUp}
                onClick={() => { setCurrentView('admin'); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Admin Dashboard
              </motion.button>
              <motion.button
                variants={fadeUp}
                onClick={() => { setCurrentView('dashboard'); setMobileOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="block w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                My Appointments {appointmentCount > 0 && `(${appointmentCount})`}
              </motion.button>
              <motion.div variants={fadeUp} className="px-4 pt-2 pb-1">
                <Button
                  onClick={() => { onBook(); setMobileOpen(false); }}
                  className="w-full rounded-full h-10 text-sm font-medium"
                >
                  Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

export default Header;