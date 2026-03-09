// components/layout/ScrollProgressBar.jsx
'use client';
import { motion, useScroll, useSpring } from 'framer-motion';

/**
 * ScrollProgressBar — thin primary-coloured line at the very top of the page
 * that fills left-to-right as the user scrolls down.
 */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] bg-primary origin-left z-[60] shadow-sm shadow-primary/30"
    />
  );
}

export default ScrollProgressBar;