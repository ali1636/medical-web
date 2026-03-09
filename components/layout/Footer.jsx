// components/layout/Footer.jsx
'use client';
import { motion } from 'framer-motion';
import { Heart, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import { DOCTOR } from '@/lib/constants';
import { spring } from '@/lib/animations';

/**
 * Footer — 3-column layout: clinic info, quick links, office hours.
 */
export function Footer({ scrollToSection }) {
  const NAV_LINKS = [
    { label: 'Home',     id: 'hero' },
    { label: 'Services', id: 'services' },
    { label: 'About',    id: 'about' },
    { label: 'Contact',  id: 'contact' },
  ];

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Clinic Info */}
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
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>{DOCTOR.address}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Quick Links</h4>
            <div className="space-y-3">
              {NAV_LINKS.map((item) => (
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

          {/* Office Hours */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-5">Office Hours</h4>
            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Monday – Friday</span>
                <span className="text-white font-medium">9:00 AM – 5:00 PM</span>
              </p>
              <p className="flex justify-between">
                <span>Saturday</span><span>Closed</span>
              </p>
              <p className="flex justify-between">
                <span>Sunday</span><span>Closed</span>
              </p>
            </div>
            <div className="mt-5 p-3 rounded-xl bg-rose-950/40 border border-rose-900/30">
              <p className="text-xs text-rose-400 font-medium flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" />
                For medical emergencies, call 911
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} {DOCTOR.practice}. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">Designed with care for better health.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;