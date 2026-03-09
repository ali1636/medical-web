// components/sections/ContactSection.jsx
'use client';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/Reveal';
import { DOCTOR } from '@/lib/constants';
import { spring, gentleSpring } from '@/lib/animations';

const CONTACT_CARDS = [
  {
    Icon:  Phone,
    label: 'Phone',
    sub:   'Mon – Fri, 9AM – 5PM',
    color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    get value() { return DOCTOR.phone; },
    get href()  { return `tel:${DOCTOR.phone.replace(/[^\d+]/g, '')}`; },
  },
  {
    Icon:  Mail,
    label: 'Email',
    sub:   'We reply within 24 hours',
    color: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400',
    get value() { return DOCTOR.email; },
    get href()  { return `mailto:${DOCTOR.email}`; },
  },
  {
    Icon:  MapPin,
    label: 'Address',
    sub:   'Get directions →',
    color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    get value() { return DOCTOR.address; },
    get href()  { return `https://maps.google.com/?q=${encodeURIComponent(DOCTOR.address)}`; },
  },
  {
    Icon:  Clock,
    label: 'Hours',
    value: 'Mon – Fri: 9:00 AM – 5:00 PM',
    sub:   'Closed weekends & holidays',
    color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
    href:  null,
  },
];

export function ContactSection({ onBook }) {
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

          {/* Contact Cards */}
          <div className="lg:col-span-2 space-y-4">
            {CONTACT_CARDS.map((item, i) => (
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
                    className="flex items-start gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
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

          {/* Map + Book CTA */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* OpenStreetMap embed — zero API key required */}
            <Reveal className="flex-1">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm h-64 lg:h-full min-h-[280px] relative">
                <iframe
                  title="Shibli Family Medicine — Clinic Location"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-96.6092%2C32.7576%2C-96.5892%2C32.7776&layer=mapnik&marker=32.7676%2C-96.5992"
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '280px', width: '100%' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0 w-full h-full"
                />
                {/* "Open in Google Maps" chip overlay */}
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(DOCTOR.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-white dark:bg-gray-900 text-xs font-semibold text-primary px-3 py-1.5 rounded-full shadow-lg border border-gray-100 dark:border-gray-800 hover:bg-primary hover:text-white transition-colors"
                >
                  <MapPin className="h-3 w-3" />
                  Open in Google Maps
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </Reveal>

            {/* Book Now CTA card */}
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

export default ContactSection;