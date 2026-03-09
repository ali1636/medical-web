// components/ui/Toast.jsx
'use client';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Bell, X } from 'lucide-react';
import { gentleSpring } from '@/lib/animations';

const COLORS = {
  success: 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800',
  error:   'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800',
  info:    'bg-blue-50 dark:bg-blue-950/90 border-blue-200 dark:border-blue-800',
};

/**
 * Toast — top-centre slide-down notification.
 * Auto-dismisses after 3.5 seconds.
 */
export function Toast({ message, type = 'info', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -24, x: '-50%', scale: 0.95 }}
      animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
      exit={{ opacity: 0, y: -16, x: '-50%', scale: 0.95 }}
      transition={gentleSpring}
      className="fixed top-4 left-1/2 z-[100] max-w-sm w-full"
    >
      <div className={`rounded-2xl border-2 shadow-2xl shadow-black/10 px-5 py-3.5 flex items-center gap-3 ${COLORS[type] || COLORS.info}`}>
        {type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />}
        {type === 'error'   && <XCircle    className="h-4 w-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />}
        {type === 'info'    && <Bell       className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
        <p className="text-sm font-semibold text-foreground flex-1">{message}</p>
        <button onClick={onClose} className="ml-1 opacity-60 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default Toast;