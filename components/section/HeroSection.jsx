// components/sections/HeroSection.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Award, BadgeCheck, Heart, Star, Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DOCTOR } from '@/lib/constants';
import { spring, gentleSpring, stagger, fadeUp, scaleIn } from '@/lib/animations';

export function HeroSection({ onBook, onViewServices }) {
  const [imgError, setImgError] = useState(false);
  const { scrollY } = useScroll();
  const y       = useTransform(scrollY, [0, 500], [0, 60]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center pt-20 lg:pt-0 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/40 dark:from-gray-950 dark:via-gray-950 dark:to-blue-950/20" />
      <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[700px] h-[700px] bg-blue-100/20 dark:bg-blue-900/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-100/20 dark:bg-violet-900/10 rounded-full blur-[100px]" />
        <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-rose-100/10 dark:bg-rose-900/5 rounded-full blur-[80px]" />
      </motion.div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Text */}
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center lg:text-left">
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
                  Book Appointment <ArrowRight className="ml-2 h-4 w-4" />
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
                { icon: Award,      label: `${DOCTOR.experience} Years Experience` },
                { icon: BadgeCheck, label: 'ABFM Certified' },
                { icon: Heart,      label: 'Patient-Centered' },
              ].map((badge, i) => (
                <motion.div key={i} variants={fadeUp} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <badge.icon className="h-4 w-4 text-primary/60" />
                  <span>{badge.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Doctor Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex justify-center lg:justify-end"
          >
            <div className="relative">
              <div className="absolute -inset-3 bg-gradient-to-br from-primary/20 to-violet-500/10 rounded-[2.5rem] rotate-2 blur-sm" />
              <div className="absolute -inset-3 bg-gradient-to-br from-blue-100/60 to-violet-100/40 dark:from-blue-900/20 dark:to-violet-900/10 rounded-[2.5rem] rotate-2" />

              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/30 max-w-xs lg:max-w-sm">
                {!imgError ? (
                  <img
                    src={DOCTOR.image}
                    alt={`${DOCTOR.name} - Family Physician`}
                    className="w-full h-auto object-cover object-top aspect-[3/4]"
                    fetchPriority="high"
                    decoding="async"
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
                      <img src={DOCTOR.image} alt={DOCTOR.name} className="w-full h-full object-cover object-top" />
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

export default HeroSection;