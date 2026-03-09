// components/booking/StickyBookCTA.jsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import { spring, gentleSpring } from '@/lib/animations';

/**
 * StickyBookCTA — a floating "Book Now" button on mobile only.
 * Appears after the user scrolls past 400px and hides when the
 * booking modal is open.
 */
export function StickyBookCTA({ onBook, visible }) {
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

export default StickyBookCTA;