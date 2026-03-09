// components/dashboard/PatientDashboard.jsx
'use client';
import { motion } from 'framer-motion';
import { CalendarDays, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge }  from '@/components/ui/badge';
import { spring, gentleSpring } from '@/lib/animations';

/** Status badge colours */
const STATUS_BADGE = {
  Pending:   'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  Accepted:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  Declined:  'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400',
  Cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
};

const STATUS_MSG_STYLE = {
  Accepted:  'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400',
  Declined:  'bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400',
  default:   'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
};

/**
 * PatientDashboard — shows the current user's own appointments,
 * loaded from localStorage. Patients can cancel Pending appointments.
 */
export function PatientDashboard({ appointments, onCancel, onBook }) {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={gentleSpring}>

          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">My Appointments</h1>
              <p className="mt-1 text-muted-foreground text-sm">
                {appointments.length > 0
                  ? `You have ${appointments.length} appointment${appointments.length > 1 ? 's' : ''}`
                  : 'No appointments scheduled yet'}
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring} className="hidden sm:block">
              <Button onClick={onBook} className="rounded-full px-5 h-10 text-sm font-medium">
                <CalendarDays className="mr-2 h-4 w-4" /> New
              </Button>
            </motion.div>
          </div>

          {/* Empty state */}
          {appointments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={gentleSpring}
              className="text-center py-20"
            >
              <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-6">
                <CalendarDays className="h-10 w-10 text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Appointments Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto text-sm">
                Schedule your first appointment with Dr. Shibli today.
              </p>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
                <Button onClick={onBook} className="rounded-full px-6">
                  Book Your First Appointment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {[...appointments].reverse().map((apt, idx) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, ...gentleSpring }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Badge className="bg-primary/10 text-primary border-0 font-bold text-xs">{apt.id}</Badge>
                          <Badge className={`rounded-full text-xs font-semibold ${STATUS_BADGE[apt.status] || STATUS_BADGE.Pending}`}>
                            {apt.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-foreground">{apt.appointmentType}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">{apt.date} at {apt.time}</p>

                        {/* Admin message */}
                        {apt.adminMessage && (
                          <div className={`mt-3 rounded-xl p-3 ${STATUS_MSG_STYLE[apt.status] || STATUS_MSG_STYLE.default}`}>
                            <p className="text-xs font-semibold mb-1">Message from clinic:</p>
                            <p className="text-sm text-foreground">{apt.adminMessage}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {apt.status === 'Pending' && (
                      <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={spring}>
                        <Button
                          onClick={() => onCancel(apt.id)}
                          variant="ghost"
                          size="sm"
                          className="rounded-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 self-end sm:self-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1.5" /> Cancel
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Mobile new button */}
          <Button onClick={onBook} className="rounded-full w-full h-12 mt-6 text-sm font-medium sm:hidden">
            <CalendarDays className="mr-2 h-4 w-4" /> New Appointment
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

export default PatientDashboard;