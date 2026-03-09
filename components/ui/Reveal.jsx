// components/ui/Reveal.jsx
'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp } from '@/lib/animations';

/**
 * Reveal — wraps any content in a scroll-triggered fade-up animation.
 * Uses IntersectionObserver so it fires only once.
 */
export function Reveal({ children, delay = 0, className = '' }) {
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

export default Reveal;