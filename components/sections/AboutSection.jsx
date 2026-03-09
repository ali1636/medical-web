// components/sections/AboutSection.jsx
'use client';
import { motion } from 'framer-motion';
import {
  GraduationCap, Activity, BadgeCheck, Star, Award,
  Globe, Languages, Stethoscope, Heart,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/Reveal';
import { DOCTOR, SERVICE_COLORS } from '@/lib/constants';
import { spring, gentleSpring } from '@/lib/animations';

export function AboutSection() {
  return (
    <section id="about" className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Main Bio ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">

          {/* Team Photo */}
          <Reveal>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/8 to-violet-500/8 rounded-3xl" />
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <img
                  src="/team-photo.png"
                  alt="Dr. Urooj Shibli and the Shibli Family Medicine team"
                  className="w-full h-auto object-cover object-center aspect-[4/3]"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = DOCTOR.image;
                    e.currentTarget.className = 'w-full h-auto object-cover object-top aspect-[4/5]';
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-5 py-4">
                  <p className="text-white text-sm font-semibold">Our Care Team</p>
                  <p className="text-white/70 text-xs">Dedicated to your health &amp; wellbeing</p>
                </div>
              </div>
              {/* Floating rating card */}
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

          {/* Bio Text */}
          <Reveal delay={0.1}>
            <span className="text-sm font-semibold text-primary tracking-widest uppercase">About Dr. Shibli</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4">
              Meet Your Doctor
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">{DOCTOR.bio}</p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              She has recently established her own private practice and is accepting both old and new patients.
              At Shibli Family Medicine and Obesity Clinic, we are committed to providing you with the most
              exceptional care in a compassionate and friendly atmosphere.
            </p>
            <div className="mt-8 space-y-4">
              {[
                { icon: GraduationCap, label: 'Education',           value: DOCTOR.education },
                { icon: Activity,      label: 'Residency',           value: DOCTOR.residency },
                { icon: BadgeCheck,    label: 'Board Certifications', value: DOCTOR.boardCert },
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

        {/* ── Education Timeline ───────────────────────────────── */}
        <Reveal className="mb-24">
          <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Education &amp; Training Timeline</h3>
          <p className="text-muted-foreground text-center mb-10 text-sm">Dr. Shibli's medical education and professional journey</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { color: 'blue',    year: '2004', label: 'MEDICAL SCHOOL', title: 'Ziauddin Medical University',       sub: 'Gold Medal — Karachi, Pakistan',        Icon: GraduationCap },
              { color: 'violet',  year: '2007', label: 'INTERNSHIP',     title: 'General Internship',                sub: 'Forbes Regional Hospital, PA',          Icon: Activity },
              { color: 'emerald', year: '2009', label: 'RESIDENCY',      title: 'Family Medicine Residency',         sub: 'Forbes / Allegheny Health Network',     Icon: BadgeCheck },
            ].map((item, i) => {
              const c = SERVICE_COLORS[item.color] || SERVICE_COLORS.blue;
              return (
                <motion.div
                  key={i}
                  className={`${c.bg} rounded-2xl p-6`}
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

        {/* ── Professional Experience ──────────────────────────── */}
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
                  <p className="text-sm text-blue-300 font-medium">Clinical leadership &amp; practice ownership</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-4xl font-extrabold text-white mb-2">15–20+</p>
                  <p className="text-sm text-blue-200">Years in primary care, preventive medicine &amp; weight management</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white mb-2">Founder &amp; Lead Physician</p>
                  <p className="text-sm text-blue-200">Shibli Family Medicine &amp; Obesity Clinic — Mesquite, TX</p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── Awards + Languages ───────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-24">
          <Reveal>
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Awards &amp; Recognitions
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
            {/* Double board cert card */}
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

        {/* ── Specialties Grid ─────────────────────────────────── */}
        <Reveal>
          <h3 className="text-2xl font-bold text-foreground mb-2 text-center">Specialties &amp; Services</h3>
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

export default AboutSection;