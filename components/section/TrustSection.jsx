// components/sections/TrustSection.jsx
'use client';
import { motion } from 'framer-motion';
import { Heart, Phone, Clock, CheckCircle } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { DOCTOR } from '@/lib/constants';
import { spring, stagger, fadeUp, scaleIn } from '@/lib/animations';

export function TrustSection() {
  const STATS = [
    { value: '15+',  label: 'Years Experience', color: 'text-blue-600 dark:text-blue-400' },
    { value: '10K+', label: 'Patients Served',  color: 'text-violet-600 dark:text-violet-400' },
    { value: 'ABFM', label: 'Board Certified',  color: 'text-emerald-600 dark:text-emerald-400' },
    { value: '4.8★', label: 'Patient Rating',   color: 'text-rose-600 dark:text-rose-400' },
  ];

  const TRUST_POINTS = [
    { icon: CheckCircle, text: 'Same-day appointments often available' },
    { icon: CheckCircle, text: 'Bilingual care — English, Urdu, Punjabi & more' },
    { icon: CheckCircle, text: 'Telehealth available for your convenience' },
    { icon: CheckCircle, text: 'Accepting new patients — all ages welcome' },
  ];

  return (
    <>
      {/* ── Stats Row ──────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50/60 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {STATS.map((stat, i) => (
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

      {/* ── "We Genuinely Care About You" Banner ───────────────── */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">

          {/* Photo side */}
          <Reveal className="relative">
            <div className="relative h-72 lg:h-full min-h-[320px] overflow-hidden">
              <img
                src="/doctor-patient.jpeg"
                alt="Dr. Urooj Shibli examining a patient"
                className="w-full h-full object-cover object-center"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 dark:to-gray-950/30 lg:block hidden" />
            </div>
          </Reveal>

          {/* Content side */}
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center px-8 sm:px-12 lg:px-16 py-14 lg:py-0 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(37,99,235,0.35),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(124,58,237,0.2),transparent_60%)]" />

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="relative max-w-xl"
            >
              <motion.div variants={scaleIn} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-blue-200 text-sm font-semibold mb-6 border border-white/15">
                <Heart className="h-3.5 w-3.5 text-rose-400" />
                Patient-Centered Care
              </motion.div>

              <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-5">
                We Genuinely<br />
                <span className="text-blue-300">Care About You.</span>
              </motion.h2>

              <motion.p variants={fadeUp} className="text-blue-100/80 text-base leading-relaxed mb-8">
                At Shibli Family Medicine, every patient is treated like family. Dr. Shibli takes the time to
                truly listen, explain, and partner with you on your health journey — not just treat symptoms.
              </motion.p>

              <motion.div variants={stagger} className="space-y-3 mb-8">
                {TRUST_POINTS.map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm text-blue-100/90 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-3">
                  <Phone className="h-4 w-4 text-blue-300 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Call Us Now</p>
                    <a href={`tel:${DOCTOR.phone.replace(/[^\d+]/g, '')}`} className="text-sm font-bold text-white hover:text-blue-200 transition-colors">
                      {DOCTOR.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-5 py-3">
                  <Clock className="h-4 w-4 text-blue-300 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-blue-300 font-semibold uppercase tracking-wider">Office Hours</p>
                    <p className="text-sm font-bold text-white">Mon–Fri, 9AM–5PM</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}

export default TrustSection;