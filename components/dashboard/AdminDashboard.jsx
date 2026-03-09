// components/dashboard/AdminDashboard.jsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, ArrowRight, CalendarDays, Clock, CheckCircle, XCircle,
  Search, Download, Filter, MessageSquare, Send, User, Phone,
  Shield, Stethoscope, X,
} from 'lucide-react';
import { Button }   from '@/components/ui/button';
import { Input }    from '@/components/ui/input';
import { Label }    from '@/components/ui/label';
import { Badge }    from '@/components/ui/badge';
import { getSupabaseClient, apiUpdateAppointment } from '@/lib/api';
import { DOCTOR }   from '@/lib/constants';
import { spring, gentleSpring } from '@/lib/animations';

/**
 * AdminDashboard
 * - Sign in via Supabase Auth (email + password)
 * - See all appointments from Supabase in real-time
 * - Accept / Decline with a custom message — sends Resend email automatically
 * - Export to CSV
 */
export function AdminDashboard({ appointments, onRefresh, showToast }) {
  // ── Auth state ─────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail,      setAdminEmail]      = useState('');
  const [password,        setPassword]        = useState('');
  const [authError,       setAuthError]       = useState('');
  const [isLoggingIn,     setIsLoggingIn]     = useState(false);

  // ── Dashboard state ────────────────────────────────────────
  const [searchTerm,   setSearchTerm]   = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionModal,  setActionModal]  = useState(null); // { apt, action }
  const [actionMsg,    setActionMsg]    = useState('');
  const [isSending,    setIsSending]    = useState(false);

  // Check for an existing session on mount
  useEffect(() => {
    getSupabaseClient()?.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true);
        onRefresh();
      }
    });
  }, []);

  // ── Auth handlers ──────────────────────────────────────────
  const handleLogin = async () => {
    if (!adminEmail || !password) {
      setAuthError('Please enter your email and password');
      return;
    }
    setIsLoggingIn(true);
    setAuthError('');
    const { error } = await getSupabaseClient()?.auth.signInWithPassword({
      email:    adminEmail.trim(),
      password: password,
    });
    setIsLoggingIn(false);
    if (error) {
      setAuthError('Invalid email or password');
    } else {
      setIsAuthenticated(true);
      onRefresh();
      showToast('Welcome to Admin Dashboard', 'success');
    }
  };

  const handleLogout = async () => {
    await getSupabaseClient()?.auth.signOut();
    setIsAuthenticated(false);
    setAdminEmail('');
    setPassword('');
  };

  // ── Appointment actions ────────────────────────────────────
  const openActionModal = (apt, action) => {
    setActionModal({ apt, action });
    setActionMsg(
      action === 'accept'
        ? `Great news! Your appointment has been confirmed for ${apt.date} at ${apt.time}. Please arrive 10 minutes early. We look forward to seeing you!`
        : `Thank you for your interest. Unfortunately, the slot for ${apt.date} at ${apt.time} is no longer available. Please call us at ${DOCTOR.phone} to reschedule.`
    );
  };

  const handleConfirmAction = async () => {
    if (!actionModal) return;
    setIsSending(true);
    const newStatus = actionModal.action === 'accept' ? 'Accepted' : 'Declined';
    try {
      // Single API call: updates DB + fires Resend email to patient
      await apiUpdateAppointment(actionModal.apt.id, {
        status:       newStatus,
        adminMessage: actionMsg.trim(),
      });
      await onRefresh();
      showToast(
        `Appointment ${newStatus.toLowerCase()} & email sent to ${actionModal.apt.email}`,
        actionModal.action === 'accept' ? 'success' : 'info'
      );
    } catch (err) {
      console.error('Confirm action error:', err);
      showToast('Failed to update. Check your connection.', 'error');
    } finally {
      setIsSending(false);
      setActionModal(null);
      setActionMsg('');
    }
  };

  // ── CSV Export ─────────────────────────────────────────────
  const handleExport = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Phone', 'Date', 'Time', 'Type', 'Status', 'Created'].join(','),
      ...appointments.map((a) => [
        a.id, a.name, a.email, a.phone, a.date, a.time,
        a.appointmentType, a.status, new Date(a.createdAt).toLocaleString(),
      ].join(',')),
    ].join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    link.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('Appointments exported successfully', 'success');
  };

  // ── Login Screen ───────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={gentleSpring}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-xl">
            <motion.div
              className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6"
              whileHover={{ rotate: 10 }}
              transition={spring}
            >
              <Lock className="h-8 w-8 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-center text-foreground mb-2">Admin Access</h2>
            <p className="text-center text-muted-foreground mb-6 text-sm">Sign in with your admin credentials</p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="admin@shiblimed.com"
                  className="mt-1 rounded-xl h-12"
                />
              </div>
              <div>
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter admin password"
                  className="mt-1 rounded-xl h-12"
                />
                <AnimatePresence>
                  {authError && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="text-xs text-rose-500 mt-2"
                    >
                      {authError}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
              <Button onClick={handleLogin} disabled={isLoggingIn} className="w-full rounded-xl h-12 text-base font-semibold disabled:opacity-70">
                {isLoggingIn ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                    Signing In…
                  </>
                ) : (
                  <>Login <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────
  const filtered = appointments.filter((a) => {
    const q = searchTerm.toLowerCase();
    return (
      (a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) ||
       a.phone.includes(q) || a.id.toLowerCase().includes(q)) &&
      (filterStatus === 'all' || a.status === filterStatus)
    );
  });

  const counts = {
    total:    appointments.length,
    pending:  appointments.filter((a) => a.status === 'Pending').length,
    accepted: appointments.filter((a) => a.status === 'Accepted').length,
    declined: appointments.filter((a) => a.status === 'Declined').length,
  };

  const STAT_CARDS = [
    { label: 'Total',    value: counts.total,    Icon: CalendarDays, cls: 'from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50 text-blue-600 dark:text-blue-400' },
    { label: 'Pending',  value: counts.pending,  Icon: Clock,        cls: 'from-slate-50 to-gray-100 dark:from-slate-900/50 dark:to-gray-800/30 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400' },
    { label: 'Accepted', value: counts.accepted, Icon: CheckCircle,  cls: 'from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400' },
    { label: 'Declined', value: counts.declined, Icon: XCircle,      cls: 'from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30 border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={gentleSpring}>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
              <p className="mt-1 text-muted-foreground text-sm">Manage all appointment requests</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" className="rounded-full px-5">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button onClick={handleLogout} variant="outline" className="rounded-full px-5">
                <Lock className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {STAT_CARDS.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, ...gentleSpring }}
                className={`bg-gradient-to-br ${s.cls} rounded-2xl border-2 p-5`}
                whileHover={{ y: -3 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-xs font-bold uppercase tracking-wider ${s.cls.split(' ').slice(-2).join(' ')}`}>{s.label}</p>
                  <s.Icon className={`h-4 w-4 ${s.cls.split(' ').slice(-2).join(' ')}`} />
                </div>
                <p className={`text-3xl font-extrabold ${s.cls.split(' ').slice(-2).join(' ')}`}>{s.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, phone, or ID…"
                className="pl-10 rounded-xl h-11"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex h-11 rounded-xl border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>

          {/* Appointment List */}
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-5">
                  <Search className="h-9 w-9 text-gray-300 dark:text-gray-600" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No matching appointments' : 'No Appointments Yet'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter' : 'Appointments will appear here when patients book'}
                </p>
              </div>
            ) : (
              [...filtered].reverse().map((apt, idx) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04, ...gentleSpring }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-sm hover:shadow-lg transition-shadow"
                  whileHover={{ y: -2 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="flex-1">
                      {/* ID + Status + Created */}
                      <div className="flex items-center gap-3 flex-wrap mb-4">
                        <Badge className="bg-primary/10 text-primary border-0 font-bold text-xs px-3 py-1">{apt.id}</Badge>
                        <Badge className={`rounded-full font-semibold text-xs px-3 py-1 ${
                          apt.status === 'Pending'   ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' :
                          apt.status === 'Accepted'  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                                                       'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}>
                          {apt.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(apt.createdAt).toLocaleDateString()} at {new Date(apt.createdAt).toLocaleTimeString()}
                        </span>
                      </div>

                      {/* Patient + Appointment Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Patient Details</p>
                          <div className="space-y-2">
                            {[
                              { Icon: User,  val: apt.name },
                              { Icon: Clock, val: apt.email },
                              { Icon: Phone, val: apt.phone },
                            ].map(({ Icon, val }, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                                <p className="text-xs text-foreground truncate">{val}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Appointment Info</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2"><Stethoscope className="h-3.5 w-3.5 text-primary" /><p className="text-xs font-semibold text-foreground">{apt.appointmentType}</p></div>
                            <div className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-primary" /><p className="text-xs text-muted-foreground">{apt.date} at {apt.time}</p></div>
                            {apt.insurance && <div className="flex items-center gap-2"><Shield className="h-3.5 w-3.5 text-primary" /><p className="text-xs text-muted-foreground">{apt.insurance}</p></div>}
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      {apt.reason && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Reason</p>
                          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-blue-100 dark:border-blue-900/50">
                            <p className="text-sm text-foreground">{apt.reason}</p>
                          </div>
                        </div>
                      )}

                      {/* Admin response */}
                      {apt.adminMessage && (
                        <div className="mb-4">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" /> Your Response
                          </p>
                          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/50">
                            <p className="text-sm text-foreground">{apt.adminMessage}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 lg:min-w-[200px]">
                      {apt.status === 'Pending' ? (
                        <>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
                            <Button onClick={() => openActionModal(apt, 'accept')} className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 h-10 text-sm">
                              <CheckCircle className="mr-2 h-4 w-4" /> Accept
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} transition={spring}>
                            <Button onClick={() => openActionModal(apt, 'decline')} variant="outline" className="w-full rounded-full border-rose-400 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 h-10 text-sm">
                              <XCircle className="mr-2 h-4 w-4" /> Decline
                            </Button>
                          </motion.div>
                        </>
                      ) : (
                        <div className="rounded-xl p-4 border border-gray-200 dark:border-gray-700 text-center">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            {apt.status === 'Accepted' ? 'Confirmed' : 'Declined'}
                          </p>
                          {apt.status === 'Accepted'
                            ? <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                            : <XCircle    className="h-8 w-8 text-rose-600 mx-auto" />}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* ── Action Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {actionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={() => setActionModal(null)}
          >
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={gentleSpring}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-xl bg-white dark:bg-gray-950 rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className={`px-7 py-5 border-b ${actionModal.action === 'accept' ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900' : 'bg-rose-50 dark:bg-rose-950/30 border-rose-100 dark:border-rose-900'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${actionModal.action === 'accept' ? 'bg-emerald-100 dark:bg-emerald-900/50' : 'bg-rose-100 dark:bg-rose-900/50'}`}>
                      {actionModal.action === 'accept'
                        ? <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        : <XCircle    className="h-5 w-5 text-rose-600 dark:text-rose-400" />}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {actionModal.action === 'accept' ? 'Accept Appointment' : 'Decline Appointment'}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {actionModal.apt.name} — {actionModal.apt.date} at {actionModal.apt.time}
                      </p>
                    </div>
                  </div>
                  <motion.button onClick={() => setActionModal(null)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-white/60 dark:hover:bg-gray-800/60" whileHover={{ scale: 1.1, rotate: 90 }} transition={spring}>
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-7 space-y-4">
                <div>
                  <Label htmlFor="actionMsg" className="text-sm font-semibold flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" /> Message to Patient
                  </Label>
                  <textarea
                    id="actionMsg"
                    value={actionMsg}
                    onChange={(e) => setActionMsg(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{actionMsg.length} characters</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.div className="flex-1" whileHover={isSending ? {} : { scale: 1.01 }} whileTap={isSending ? {} : { scale: 0.98 }} transition={spring}>
                    <Button
                      onClick={handleConfirmAction}
                      disabled={isSending}
                      className={`w-full rounded-2xl h-11 font-bold disabled:opacity-70 ${
                        actionModal.action === 'accept'
                          ? 'bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20'
                          : 'bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-500/20'
                      }`}
                    >
                      {isSending ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="mr-2 h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                          Sending Email…
                        </>
                      ) : (
                        <><Send className="mr-2 h-4 w-4" /> Confirm &amp; Send Email</>
                      )}
                    </Button>
                  </motion.div>
                  <Button onClick={() => setActionModal(null)} disabled={isSending} variant="outline" className="flex-1 rounded-2xl h-11 font-semibold border-2 disabled:opacity-50">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;