// components/booking/CustomDatePicker.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format, startOfDay, addMonths, getDaysInMonth, getDay,
  isBefore, isAfter, isSameDay, startOfMonth, addDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { spring, gentleSpring } from '@/lib/animations';

/**
 * CustomDatePicker — a fully custom calendar without any library.
 * Disables weekends, past dates, and dates beyond 3 months.
 */
export function CustomDatePicker({ selectedDate, onSelectDate }) {
  const today   = startOfDay(new Date());
  const maxDate = addMonths(today, 3);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(today));

  const daysInMonth    = getDaysInMonth(viewMonth);
  const firstDayOfWeek = getDay(viewMonth);
  const DAY_NAMES      = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const canGoPrev = isAfter(viewMonth, startOfMonth(today));
  const canGoNext = isBefore(viewMonth, startOfMonth(maxDate));

  // Build grid: leading null cells + actual dates
  const cells = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(addDays(viewMonth, d - 1));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 w-full border border-gray-100 dark:border-gray-800 shadow-sm">

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={() => canGoPrev && setViewMonth((p) => addMonths(p, -1))}
          disabled={!canGoPrev}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          whileHover={canGoPrev ? { scale: 1.1 } : {}}
          whileTap={canGoPrev ? { scale: 0.9 } : {}}
          transition={spring}
        >
          <ChevronLeft className="h-4 w-4" />
        </motion.button>

        <AnimatePresence mode="wait">
          <motion.span
            key={format(viewMonth, 'MMM-yyyy')}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-bold text-foreground"
          >
            {format(viewMonth, 'MMMM yyyy')}
          </motion.span>
        </AnimatePresence>

        <motion.button
          onClick={() => canGoNext && setViewMonth((p) => addMonths(p, 1))}
          disabled={!canGoNext}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          whileHover={canGoNext ? { scale: 1.1 } : {}}
          whileTap={canGoNext ? { scale: 0.9 } : {}}
          transition={spring}
        >
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_NAMES.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-muted-foreground/60 py-1">{d}</div>
        ))}
      </div>

      {/* Date Grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} />;

          const isWeekend     = getDay(date) === 0 || getDay(date) === 6;
          const isPast        = isBefore(date, today);
          const isTooFar      = isAfter(date, maxDate);
          const isDisabled    = isWeekend || isPast || isTooFar;
          const isSelected    = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday       = isSameDay(date, today);

          return (
            <motion.button
              key={date.toISOString()}
              onClick={() => !isDisabled && onSelectDate(date)}
              disabled={isDisabled}
              className={`
                relative h-9 w-full rounded-xl text-xs font-medium transition-colors duration-150
                ${isDisabled ? 'text-gray-300 dark:text-gray-700 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected ? 'bg-primary text-primary-foreground shadow-md' : ''}
                ${!isSelected && isToday && !isDisabled ? 'border-2 border-primary text-primary font-bold' : ''}
                ${!isSelected && !isToday && !isDisabled ? 'bg-gray-50 dark:bg-gray-800 text-foreground hover:bg-primary/10 hover:text-primary border border-gray-100 dark:border-gray-700' : ''}
              `}
              whileHover={!isDisabled && !isSelected ? { scale: 1.08 } : {}}
              whileTap={!isDisabled ? { scale: 0.94 } : {}}
              animate={isSelected ? { scale: 1.05 } : { scale: 1 }}
              transition={spring}
            >
              {format(date, 'd')}
              {isToday && !isSelected && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Selected date label */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            transition={gentleSpring}
            className="mt-3 overflow-hidden"
          >
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                <Check className="h-3 w-3" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CustomDatePicker;