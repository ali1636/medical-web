// lib/animations.js
// ── Shared Framer Motion variants & spring configs ──────────────

export const spring = { type: 'spring', stiffness: 400, damping: 30 };

export const gentleSpring = { type: 'spring', stiffness: 200, damping: 25 };

export const fadeUp = {
  hidden:  { opacity: 0, y: 32, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

export const stagger = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92, filter: 'blur(4px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};