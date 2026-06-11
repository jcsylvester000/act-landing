'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import type { Job, Message } from '@/store';
import { Button, Badge, StatCard, Modal, StarRating, Toast, Divider, Peso } from '@/components/ui';
import InvoiceCard from '@/components/billing/InvoiceCard';
import BillingCard from '@/components/billing/BillingCard';
import ChatHistorySection from '@/components/chat/ChatHistory';

const ClientDashboard: React.FC = () => {
  const router = useRouter();
  const { currentUser, jobs, updateJob, updateUser, addNotification, messages, sendMessage, markMessagesRead, respondToCalendarInvite, serviceInvoices, billingStatements, respondToServiceInvoice, hydrate } = useStore();

  // ─── ALL STATE (hooks first) ──────────────────────────────────────────────
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [reviewJob, setReviewJob] = useState<Job | null>(null);
  const [cancelConfirmJob, setCancelConfirmJob] = useState<Job | null>(null);
  const [msgJob, setMsgJob] = useState<Job | null>(null);
  const [invRevisionNote, setInvRevisionNote] = useState('');
  const [invCancelNote, setInvCancelNote] = useState('');
  const [respondingInvoiceId, setRespondingInvoiceId] = useState<string | null>(null);
  const [respondAction, setRespondAction] = useState<'revision' | 'cancel' | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const [authChecked, setAuthChecked] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/dashboard');
    } else {
      setAuthChecked(true);
    }
  }, [currentUser, router]);

  // Hydrate from the server (system of record) + run 7-day chat retention job
  useEffect(() => { hydrate(); }, [hydrate]);

  // Deep-link: /dashboard#chat-history scrolls to the chat history section
  useEffect(() => {
    if (authChecked && typeof window !== 'undefined' && window.location.hash === '#chat-history') {
      setTimeout(() => document.getElementById('chat-history')?.scrollIntoView({ behavior: 'smooth' }), 300);
    }
  }, [authChecked]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  // ─── LOADING GATE ────────────────────────────────────────────────────────
  if (!authChecked || !currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cloud)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--polar)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--slate)', fontFamily: 'var(--font-body)', fontSize: 14 }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ─── DERIVED DATA ────────────────────────────────────────────────────────
  const myJobs = jobs.filter(j => j.clientId === currentUser.id);
  const activeJob = myJobs.find(j => ['Active', 'Confirmed', 'Scheduled'].includes(j.status));
  const completedJobs = myJobs.filter(j => j.status === 'Completed');
  const pendingJobs = myJobs.filter(j => ['Pending', 'Awaiting Payment'].includes(j.status));
  const totalSpent = completedJobs.reduce((sum, j) => sum + j.totalPrice, 0);
  const cancellableStatuses = ['Pending', 'Awaiting Payment', 'Confirmed']; // Confirmed cancellable before tech dispatches

  const statuses = ['All', 'Pending', 'Awaiting Payment', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
  const filteredJobs = filterStatus === 'All' ? myJobs : myJobs.filter(j => j.status === filterStatus);

  const daysUntilDue = currentUser.nextDueDate
    ? Math.ceil((new Date(currentUser.nextDueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // ─── HANDLERS ────────────────────────────────────────────────────────────
  const handleSubmitReview = () => {
    if (!reviewJob) return;
    updateJob(reviewJob.id, { rating, review: reviewText });
    addNotification({ userId: currentUser.id, jobId: reviewJob.id, message: 'Thank you for your review!', type: 'success', read: false });
    const newDue = new Date(reviewJob.preferredDate || new Date());
    newDue.setDate(newDue.getDate() + (reviewJob.serviceType === 'Basic Cleaning' ? 90 : 180));
    updateUser(currentUser.id, {
      nextDueDate: newDue.toISOString().split('T')[0],
      lastServiceDate: reviewJob.preferredDate,
      preferredTechnicianId: reviewJob.technicianId,
      preferredTechnicianName: reviewJob.technicianName,
    });
    setReviewJob(null); setReviewText(''); setRating(5);
    showToast('Review submitted! Thank you.', 'success');
  };

  const handleCancelJob = (job: Job) => {
    updateJob(job.id, { status: 'Cancelled', cancellationReason: cancelReason || 'Cancelled by client' });
    addNotification({ userId: currentUser.id, jobId: job.id, message: `Booking ${job.id} has been cancelled.`, type: 'info', read: false });
    setCancelConfirmJob(null);
    setCancelReason('');
    setSelectedJob(null);
    showToast('Booking cancelled successfully.', 'info');
  };

  const handleRebook = (job: Job) => {
    setSelectedJob(null);
    router.push(`/book?st=${encodeURIComponent(job.serviceType)}&at=${encodeURIComponent(job.acType)}&units=${job.numberOfUnits}&techId=${job.technicianId || ''}`);
  };

  // ─── INVOICE / BILLING HELPERS ──────────────────────────────────────────
  const myInvoices = (serviceInvoices ?? []).filter(i => i.clientId === currentUser?.id);
  const myBilling = (billingStatements ?? []).filter(b => b.clientId === currentUser?.id);
  const pendingInvoices = myInvoices.filter(i => i.status === 'Sent' || i.status === 'Viewed by Client');
  const pendingBilling = myBilling.filter(b => b.status === 'Sent to Client' && b.amountDue > 0);
  // Client-visible records: never show operator/admin internal drafts
  const visibleInvoices = myInvoices.filter(i => i.status !== 'Draft');
  const visibleBilling = myBilling.filter(b => ['Sent to Client', 'Paid', 'Overdue', 'Disputed'].includes(b.status));
  const billingInPrep = completedJobs.filter(j => !myBilling.some(b => b.jobId === j.id && ['Sent to Client', 'Paid', 'Overdue', 'Disputed'].includes(b.status)));
  const totalFinancialAlerts = pendingInvoices.length + pendingBilling.length;

  const handleInvoiceAccept = (invoiceId: string) => {
    respondToServiceInvoice(invoiceId, 'accept', undefined, currentUser?.id);
    showToast('Invoice accepted! Your service is confirmed.', 'success');
  };
  const handleInvoiceRevision = (invoiceId: string) => {
    setRespondingInvoiceId(invoiceId);
    setRespondAction('revision');
    setInvRevisionNote('');
  };
  const handleInvoiceCancel = (invoiceId: string) => {
    setRespondingInvoiceId(invoiceId);
    setRespondAction('cancel');
    setInvCancelNote('');
  };
  const submitInvoiceResponse = () => {
    if (!respondingInvoiceId || !respondAction) return;
    const note = respondAction === 'revision' ? invRevisionNote : invCancelNote;
    respondToServiceInvoice(respondingInvoiceId, respondAction, note, currentUser?.id);
    showToast(respondAction === 'revision' ? 'Revision request sent to your operator.' : 'Booking cancelled. Your operator has been notified.', respondAction === 'revision' ? 'info' : 'warning');
    setRespondingInvoiceId(null);
    setRespondAction(null);
  };

  // ─── MESSAGING HELPERS ──────────────────────────────────────────────────
  const jobsWithMessages = myJobs.filter(j => j.operatorId || j.status === 'Pending'); // show messages for Pending even without operator
  const getJobThread = (jobId: string): Message[] =>
    (messages ?? []).filter(m => m.jobId === jobId).sort((a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  const totalUnreadMessages = (messages ?? []).filter(m =>
    myJobs.some(j => j.id === m.jobId) && !m.readBy.includes(currentUser.id) && m.senderId !== currentUser.id
  ).length;

  const handleOpenMsgJob = (job: Job) => {
    setMsgJob(job);
    markMessagesRead(job.id, currentUser.id);
    // scroll after state update
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !msgJob) return;
    sendMessage({
      jobId: msgJob.id,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: 'client',
      content: newMessage.trim(),
      type: 'text',
      readBy: [currentUser.id],
    });
    setNewMessage('');
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
  };

  const handleRespondCalendar = (messageId: string, accepted: boolean) => {
    respondToCalendarInvite(messageId, accepted, currentUser.id);
    showToast(accepted ? 'Appointment confirmed! ✅' : 'Reschedule requested. Your operator will follow up.', accepted ? 'success' : 'info');
  };

  const statusIcon: Record<string, string> = {
    'Pending': '🕐', 'Awaiting Payment': '💳', 'Confirmed': '✅',
    'Scheduled': '📅', 'Active': '🔧', 'Completed': '✓', 'Cancelled': '✕',
  };

  const statusNote: Record<string, string> = {
    'Pending': 'Submitted — waiting for payment verification',
    'Awaiting Payment': 'Screenshot uploaded — verifying payment',
    'Confirmed': 'Payment confirmed — technician assigned',
    'Scheduled': 'Technician confirmed for your date',
    'Active': 'Technician is on-site right now',
    'Completed': 'Service completed',
    'Cancelled': 'This booking was cancelled',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cloud)', fontFamily: 'var(--font-body)' }}>
      <Toast {...toast} />

      {/* ─── HEADER ─── */}
      <div style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)',
        padding: '90px 32px 48px', color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 80% at 80% 50%, rgba(91,196,214,0.1), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div className="dashboard-header-inner" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>Client Portal</div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px', marginBottom: 10 }}>
                Good day, {currentUser.firstName}! 👋
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>
                {daysUntilDue !== null ? (
                  daysUntilDue <= 0
                    ? <span style={{ color: '#fca5a5', fontWeight: 600 }}>⚠️ Your AC is overdue for service — book now to prevent damage!</span>
                    : daysUntilDue <= 14
                    ? `⏰ Your AC is due for service in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`
                    : `Next recommended service in ${daysUntilDue} days.`
                ) : 'Manage your aircon services from here.'}
              </p>
            </div>
            <Button variant="primary" size="lg" onClick={() => router.push('/book')} style={{ fontWeight: 800, whiteSpace: 'nowrap', fontSize: 15 }}>
              + Book a Service
            </Button>
          </div>
        </div>
      </div>

      <div className="dashboard-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 60px' }}>

        {/* ─── KPI STATS ─── */}
        <div className="dashboard-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          <StatCard label="Total Bookings" value={myJobs.length} sub="All time" icon={<span>📋</span>} />
          <StatCard label="Completed" value={completedJobs.length} sub="Services done" accent="var(--verified)" icon={<span>✅</span>} trend="up" />
          <StatCard label="In Progress" value={pendingJobs.length} sub="Awaiting confirmation" accent="var(--caution)" icon={<span>⏳</span>} />
          <StatCard label="Total Spent" value={totalSpent > 0 ? `₱${totalSpent.toLocaleString()}` : '₱0'} sub="Across all services" icon={<span>💰</span>} />
          {totalFinancialAlerts > 0 && <StatCard label="Needs Attention" value={totalFinancialAlerts} sub="Invoices / billing pending" accent="var(--ember)" icon={<span>🧾</span>} />}
        </div>

        {/* ─── ACTIVE JOB CARD ─── */}
        {activeJob && (
          <div style={{
            background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)',
            borderRadius: 20, padding: '24px 28px', marginBottom: 24, color: 'white',
            boxShadow: 'var(--shadow-polar)', animation: 'fadeInUp 0.5s var(--ease-out) both',
          }}>
            <div className="active-job-inner" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 99, letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {activeJob.status === 'Active' ? '🔧 In Progress' : activeJob.status === 'Confirmed' ? '✅ Confirmed' : '📅 Upcoming'}
                  </span>
                  <Badge label={activeJob.paymentStatus} dot />
                </div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, marginBottom: 6, lineHeight: 1.2 }}>
                  {activeJob.serviceType} — {activeJob.numberOfUnits} unit{activeJob.numberOfUnits > 1 ? 's' : ''}
                </h3>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[
                    { icon: '📍', text: `${activeJob.serviceAddress}, ${activeJob.city}` },
                    { icon: '📅', text: `${activeJob.preferredDate} · ${activeJob.timeSlot === 'AM' ? 'Morning' : activeJob.timeSlot === 'PM' ? 'Afternoon' : 'Flexible'}` },
                  ].map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                      <span>{d.icon}</span><span>{d.text}</span>
                    </div>
                  ))}
                </div>
                {activeJob.technicianName ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(27,168,126,0.15)', border: '1px solid rgba(27,168,126,0.3)', borderRadius: 99, padding: '5px 12px', fontSize: 13, color: '#6ee7c4', fontWeight: 600 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verified)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
                    {activeJob.technicianName} · ACT Accredited Technician
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(245,166,35,0.15)', border: '1px solid rgba(245,166,35,0.3)', borderRadius: 99, padding: '5px 12px', fontSize: 13, color: '#F5A623', fontWeight: 600 }}>
                    ⏳ Technician being assigned
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 2 }}>Total</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800 }}>₱{activeJob.totalPrice.toLocaleString()}</div>
                </div>
                {activeJob.balanceDue > 0 && (
                  <div style={{ background: 'rgba(255,107,74,0.15)', border: '1px solid rgba(255,107,74,0.3)', borderRadius: 10, padding: '8px 12px', textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,107,74,0.7)', marginBottom: 1 }}>Balance due after service</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700, color: 'var(--ember)' }}>₱{activeJob.balanceDue.toLocaleString()}</div>
                  </div>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedJob(activeJob)} style={{ borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: 13 }}>
                  View Details
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ─── SERVICE DUE REMINDER ─── */}
        {daysUntilDue !== null && daysUntilDue <= 14 && (
          <div style={{
            background: daysUntilDue <= 0 ? 'var(--alert-bg)' : 'var(--caution-bg)',
            border: `1.5px solid ${daysUntilDue <= 0 ? 'rgba(229,72,77,0.3)' : 'rgba(245,166,35,0.3)'}`,
            borderRadius: 16, padding: '18px 22px', marginBottom: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 28 }}>{daysUntilDue <= 0 ? '⚠️' : '🔔'}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>
                  {daysUntilDue <= 0 ? 'Service Overdue!' : `Service Due in ${daysUntilDue} Day${daysUntilDue !== 1 ? 's' : ''}`}
                </div>
                <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 2 }}>
                  {daysUntilDue <= 0
                    ? 'Your AC needs attention. Book now to maintain performance and prevent damage.'
                    : `Recommended before ${new Date(currentUser.nextDueDate!).toLocaleDateString('en-PH', { month: 'long', day: 'numeric' })}`}
                </div>
              </div>
            </div>
            <Button variant="primary" size="sm" onClick={() => router.push('/book')}>Book Now →</Button>
          </div>
        )}

        {/* ─── FIRST-TIME EMPTY STATE ─── */}
        {myJobs.length === 0 && (
          <div style={{
            background: 'white', borderRadius: 20, border: '1px solid var(--border)',
            padding: '60px 32px', textAlign: 'center', marginBottom: 24, boxShadow: 'var(--shadow-xs)',
          }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>❄️</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 10 }}>Welcome to ACT!</h2>
            <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: '0 auto 28px' }}>
              You don&apos;t have any bookings yet. Book your first aircon service — it takes less than 3 minutes and your slot is reserved with a small fee.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" size="lg" onClick={() => router.push('/book')} style={{ fontWeight: 800 }}>Book Your First Service →</Button>
              <Button variant="ghost" size="lg" onClick={() => router.push('/services')}>See Services & Pricing</Button>
            </div>
          </div>
        )}

        {/* ─── JOB HISTORY ─── */}
        {myJobs.length > 0 && (
          <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            {/* Toolbar */}
            <div className="job-list-toolbar" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--midnight)' }}>
                My Bookings
                <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>({filteredJobs.length})</span>
              </h2>
              <div className="job-filter-row" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {statuses.map(s => {
                  const count = s === 'All' ? myJobs.length : myJobs.filter(j => j.status === s).length;
                  if (s !== 'All' && count === 0) return null;
                  return (
                    <button key={s} onClick={() => setFilterStatus(s)} style={{
                      padding: '5px 12px', borderRadius: 99, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
                      background: filterStatus === s ? 'var(--polar)' : 'var(--snow)',
                      color: filterStatus === s ? 'white' : 'var(--slate)', transition: 'all 0.15s',
                    }}>
                      {s}{s !== 'All' && ` (${count})`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Jobs list */}
            {filteredJobs.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <p style={{ color: 'var(--slate)', fontSize: 14 }}>No {filterStatus !== 'All' ? filterStatus.toLowerCase() : ''} bookings.</p>
              </div>
            ) : (
              <div>
                {filteredJobs.map((job, idx) => (
                  <div key={job.id} onClick={() => setSelectedJob(job)} className="job-row" style={{
                    padding: '18px 24px', borderBottom: idx < filteredJobs.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: 16, cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--snow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                        background: job.status === 'Completed' ? 'var(--verified-bg)' : job.status === 'Active' ? 'rgba(10,110,143,0.1)' : job.status === 'Cancelled' ? '#FEE2E2' : 'var(--snow)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                        border: `1px solid ${job.status === 'Completed' ? 'rgba(27,168,126,0.2)' : job.status === 'Cancelled' ? 'rgba(229,72,77,0.2)' : 'var(--border)'}`,
                      }}>
                        {statusIcon[job.status] || '📋'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: job.status === 'Cancelled' ? 'var(--slate)' : 'var(--ink)', marginBottom: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {job.serviceType}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--slate)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span>{job.acType} · {job.numberOfUnits} unit{job.numberOfUnits > 1 ? 's' : ''}</span>
                          <span>·</span>
                          <span>{job.city}</span>
                          <span>·</span>
                          <span>{job.preferredDate}</span>
                        </div>
                        {job.status === 'Completed' && job.rating ? (
                          <div style={{ marginTop: 4, display: 'flex', gap: 2 }}>
                            {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: 11, color: s <= job.rating! ? '#F5A623' : 'var(--mist)' }}>★</span>)}
                          </div>
                        ) : job.status === 'Completed' && !job.rating ? (
                          <div style={{ marginTop: 6 }}>
                            <button
                              onClick={e => { e.stopPropagation(); setReviewJob(job); }}
                              style={{ fontSize: 11, fontWeight: 700, color: 'var(--polar)', background: 'var(--breeze)', border: '1px solid var(--mist)', borderRadius: 99, padding: '3px 10px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
                            >
                              ⭐ Leave a Review
                            </button>
                          </div>
                        ) : job.status !== 'Cancelled' ? (
                          <div style={{ marginTop: 4, fontSize: 11, color: 'var(--slate)' }}>{statusNote[job.status]}</div>
                        ) : null}
                      </div>
                    </div>
                    <div className="job-row-right" style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: job.status === 'Cancelled' ? 'var(--slate)' : 'var(--ink)' }}>
                          ₱{job.totalPrice.toLocaleString()}
                        </div>
                        <Badge label={job.status} size="xs" dot />
                      </div>
                      <span style={{ color: 'var(--mist)', fontSize: 18 }}>›</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── JOB DETAIL MODAL ─── */}
      <Modal open={!!selectedJob} onClose={() => setSelectedJob(null)} title={selectedJob?.serviceType} subtitle={`Booking #${selectedJob?.id}`} maxWidth={560}>
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <Badge label={selectedJob.status} dot />
              <Badge label={selectedJob.paymentStatus} />
            </div>

            {/* Status note */}
            {statusNote[selectedJob.status] && (
              <div style={{ background: 'var(--breeze)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: 'var(--polar)', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>{statusIcon[selectedJob.status]}</span>
                <span>{statusNote[selectedJob.status]}</span>
              </div>
            )}

            {/* Details */}
            {[
              { label: 'Service', value: selectedJob.serviceType },
              { label: 'AC Type', value: selectedJob.acType },
              { label: 'Units', value: `${selectedJob.numberOfUnits} unit${selectedJob.numberOfUnits > 1 ? 's' : ''}` },
              { label: 'Address', value: `${selectedJob.serviceAddress}, ${selectedJob.city}` },
              { label: 'Scheduled', value: `${selectedJob.preferredDate} · ${selectedJob.timeSlot}` },
              ...(selectedJob.technicianName ? [{ label: 'Technician', value: `${selectedJob.technicianName} · ACT Accredited` }] : []),
              ...(selectedJob.preferredPaymentMethod ? [{ label: 'Payment Method', value: selectedJob.preferredPaymentMethod }] : []),
              ...(selectedJob.specialInstructions ? [{ label: 'Notes', value: selectedJob.specialInstructions }] : []),
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--slate)', fontWeight: 600, flexShrink: 0 }}>{r.label}</span>
                <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{r.value}</span>
              </div>
            ))}

            <Divider my={16} />

            {/* Financials */}
            <div style={{ background: 'var(--snow)', borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Total Price', value: selectedJob.totalPrice, bold: false },
                { label: 'Reservation Fee Paid', value: selectedJob.reservationFee, bold: false },
                { label: 'Balance Due', value: selectedJob.balanceDue, bold: true },
              ].map(f => (
                <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--slate)' }}>{f.label}</span>
                  <Peso amount={f.value} size={f.bold ? 16 : 14} color={f.bold && f.value > 0 ? 'var(--polar)' : 'var(--ink)'} bold={f.bold} />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
              {/* Leave review — completed, no review yet */}
              {selectedJob.status === 'Completed' && !selectedJob.rating && (
                <Button variant="primary" fullWidth onClick={() => { setReviewJob(selectedJob); setSelectedJob(null); }}>
                  ★ Leave a Review
                </Button>
              )}

              {/* Message operator — for pending/confirmed/active jobs */}
              {['Pending', 'Confirmed', 'Active'].includes(selectedJob.status) && (
                <Button variant="secondary" fullWidth onClick={() => { handleOpenMsgJob(selectedJob); setSelectedJob(null); }}>
                  💬 Message Your Operator
                </Button>
              )}

              {/* Re-book — completed */}
              {selectedJob.status === 'Completed' && (
                <Button variant="secondary" fullWidth onClick={() => handleRebook(selectedJob)}>
                  🔄 Book Same Service Again
                </Button>
              )}

              {/* Cancel — only pending/awaiting payment */}
              {cancellableStatuses.includes(selectedJob.status) && (
                <Button variant="danger" fullWidth onClick={() => { setCancelConfirmJob(selectedJob); setSelectedJob(null); }}>
                  ✕ Cancel This Booking
                </Button>
              )}

              <Button variant="ghost" fullWidth onClick={() => setSelectedJob(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── CANCEL CONFIRM MODAL ─── */}
      <Modal open={!!cancelConfirmJob} onClose={() => { setCancelConfirmJob(null); setCancelReason(''); }} title="Cancel Booking?" maxWidth={440}>
        {cancelConfirmJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--alert-bg)', borderRadius: 12, padding: 16, border: '1px solid rgba(229,72,77,0.2)' }}>
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>
                Are you sure you want to cancel <strong>{cancelConfirmJob.serviceType}</strong> on <strong>{cancelConfirmJob.preferredDate}</strong>?
              </p>
              {cancelConfirmJob.reservationFee > 0 && (
                <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 8 }}>
                  ⚠️ The reservation fee of <strong style={{ fontFamily: 'var(--font-mono)' }}>₱{cancelConfirmJob.reservationFee.toLocaleString()}</strong> is non-refundable per ACT&apos;s cancellation policy.
                </p>
              )}
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Cancellation (optional)</label>
              <textarea
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                placeholder="e.g. Change of plans, rescheduling to a later date..."
                rows={3}
                style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 14, resize: 'none', outline: 'none' }}
                onFocus={e => { e.target.style.borderColor = 'var(--alert)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="ghost" fullWidth onClick={() => { setCancelConfirmJob(null); setCancelReason(''); }}>Keep Booking</Button>
              <Button variant="danger" fullWidth onClick={() => handleCancelJob(cancelConfirmJob)}>Yes, Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── REVIEW MODAL ─── */}
      <Modal open={!!reviewJob} onClose={() => setReviewJob(null)} title="Leave a Review" subtitle={reviewJob?.serviceType} maxWidth={440}>
        {reviewJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 16 }}>How was your experience with ACT?</p>
              <StarRating value={rating} onChange={setRating} size={36} />
              <p style={{ fontSize: 13, color: rating >= 4 ? 'var(--verified)' : rating === 3 ? 'var(--caution)' : 'var(--alert)', marginTop: 8, fontWeight: 600 }}>
                {['', 'Terrible 😞', 'Poor 😕', 'Okay 😐', 'Good 😊', 'Excellent! 🌟'][rating]}
              </p>
            </div>
            <textarea
              placeholder="Share details about your experience — punctuality, quality of work, technician professionalism, anything else..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '13px 16px',
                border: '1.5px solid var(--border)', borderRadius: 12,
                fontFamily: 'var(--font-body)', fontSize: 14,
                resize: 'none', outline: 'none', lineHeight: 1.6, transition: 'border-color 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--polar)'; e.target.style.boxShadow = '0 0 0 3px rgba(10,110,143,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="primary" fullWidth onClick={handleSubmitReview}>Submit Review</Button>
              <Button variant="ghost" onClick={() => setReviewJob(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ─── INVOICES SECTION ─── */}
      {visibleInvoices.length > 0 && (
        <div className="dashboard-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 24px' }}>
          <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--midnight)' }}>🧾 Service Invoices</h2>
                {pendingInvoices.length > 0 && (
                  <span style={{ background: 'var(--ember)', color: 'white', borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '2px 8px' }}>{pendingInvoices.length} pending response</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--slate)' }}>Formal quotes from your operator</div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {visibleInvoices.map(inv => (
                <InvoiceCard
                  key={inv.id}
                  invoice={inv}
                  viewerRole="client"
                  onAccept={() => handleInvoiceAccept(inv.id)}
                  onRequestRevision={() => handleInvoiceRevision(inv.id)}
                  onCancel={() => handleInvoiceCancel(inv.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── BILLING SECTION ─── */}
      {(visibleBilling.length > 0 || billingInPrep.length > 0) && (
        <div className="dashboard-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 24px' }}>
          <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--midnight)' }}>💼 Billing Statements</h2>
                {pendingBilling.length > 0 && (
                  <span style={{ background: 'var(--caution)', color: 'white', borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '2px 8px' }}>{pendingBilling.length} balance due</span>
                )}
              </div>
              <div style={{ fontSize: 13, color: 'var(--slate)' }}>Post-service billing records</div>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {billingInPrep.map(j => (
                <div key={j.id} style={{ background: 'var(--snow)', border: '1px dashed var(--border)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 20 }}>📋</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Billing statement for {j.id} is being prepared</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{j.serviceType} · completed {j.preferredDate} — you&apos;ll be notified the moment it&apos;s ready.</div>
                  </div>
                </div>
              ))}
              {visibleBilling.map(bill => (
                <BillingCard key={bill.id} billing={bill} viewerRole="client" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── CHAT HISTORY (7-day retention → JSON archives) ─── */}
      <div id="chat-history" className="dashboard-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 24px', scrollMarginTop: 90 }}>
        <ChatHistorySection role="client" />
      </div>

      {/* Invoice Response Modal */}
      <Modal
        open={!!respondingInvoiceId && !!respondAction}
        onClose={() => { setRespondingInvoiceId(null); setRespondAction(null); }}
        title={respondAction === 'revision' ? 'Request Price Revision' : 'Cancel Booking'}
        maxWidth={440}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {respondAction === 'revision' && (
            <>
              <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--slate)', lineHeight: 1.7 }}>
                ✏️ Tell your operator why you think the price is too high. They&apos;ll review and may revise or clarify the invoice.
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Message *</label>
                <textarea
                  value={invRevisionNote}
                  onChange={e => setInvRevisionNote(e.target.value)}
                  placeholder="e.g. I think the price for 2 units seems higher than expected. Can you explain the breakdown?"
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 14, resize: 'none', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="secondary" fullWidth onClick={submitInvoiceResponse} disabled={!invRevisionNote.trim()}>Send Revision Request</Button>
                <Button variant="ghost" onClick={() => { setRespondingInvoiceId(null); setRespondAction(null); }}>Cancel</Button>
              </div>
            </>
          )}
          {respondAction === 'cancel' && (
            <>
              <div style={{ background: 'var(--alert-bg)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--ink)', lineHeight: 1.7 }}>
                ⚠️ Cancelling after submitting a booking will result in the <strong>reservation fee being forfeited</strong> per ACT&apos;s cancellation policy.
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for Cancellation</label>
                <textarea
                  value={invCancelNote}
                  onChange={e => setInvCancelNote(e.target.value)}
                  placeholder="e.g. The total price is too high for my budget."
                  rows={3}
                  style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 14, resize: 'none', outline: 'none' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--alert)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Button variant="ghost" fullWidth onClick={() => { setRespondingInvoiceId(null); setRespondAction(null); }}>Keep Booking</Button>
                <Button variant="danger" fullWidth onClick={submitInvoiceResponse}>Confirm Cancellation</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* ─── MESSAGES SECTION ─── */}
      {jobsWithMessages.length > 0 && (
        <div className="dashboard-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
          <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--midnight)' }}>Messages from Your Operator</h2>
                {totalUnreadMessages > 0 && (
                  <span style={{ background: 'var(--ember)', color: 'white', borderRadius: 99, fontSize: 11, fontWeight: 800, padding: '2px 8px' }}>{totalUnreadMessages} new</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {jobsWithMessages.map((job, idx) => {
                const thread = getJobThread(job.id);
                const lastMsg = thread[thread.length - 1];
                const unread = (messages ?? []).filter(m => m.jobId === job.id && !m.readBy.includes(currentUser.id) && m.senderId !== currentUser.id).length;
                return (
                  <div key={job.id} onClick={() => handleOpenMsgJob(job)} style={{
                    padding: '16px 24px', borderBottom: idx < jobsWithMessages.length - 1 ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--snow)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'linear-gradient(135deg, var(--polar), var(--frost))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                      {job.operatorName?.[0] || '?'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{job.operatorName || 'Your Operator'}</div>
                        {unread > 0 && <span style={{ background: 'var(--ember)', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '2px 7px', flexShrink: 0 }}>{unread}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 3 }}>{job.id} · {job.serviceType} · {job.city}</div>
                      {lastMsg && (
                        <div style={{ fontSize: 13, color: unread > 0 ? 'var(--ink)' : 'var(--slate)', fontWeight: unread > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {lastMsg.senderId === currentUser.id ? 'You: ' : ''}{lastMsg.type === 'calendar_invite' ? '📅 Calendar Invite' : lastMsg.content}
                        </div>
                      )}
                    </div>
                    <Badge label={job.status} size="xs" />
                    <span style={{ color: 'var(--mist)', fontSize: 18, flexShrink: 0 }}>›</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── MESSAGE THREAD MODAL ─── */}
      <Modal open={!!msgJob} onClose={() => setMsgJob(null)} title={`Chat with ${msgJob?.operatorName || 'Operator'}`} subtitle={msgJob ? `${msgJob.id} · ${msgJob.serviceType}` : undefined} maxWidth={580}>
        {msgJob && (() => {
          const thread = getJobThread(msgJob.id);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', height: 480 }}>
              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {thread.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', gap: 8 }}>
                    <div style={{ fontSize: 40 }}>💬</div>
                    <div style={{ fontWeight: 700, color: 'var(--ink)' }}>No messages yet</div>
                    <div style={{ fontSize: 13 }}>Your operator will be in touch shortly.</div>
                  </div>
                ) : thread.map(msg => {
                  const isMine = msg.senderId === currentUser.id;
                  const isSystem = msg.senderRole === 'system' || msg.type === 'status_update';

                  if (isSystem) return (
                    <div key={msg.id} style={{ textAlign: 'center', margin: '6px 0' }}>
                      <span style={{ background: 'var(--breeze)', color: 'var(--slate)', fontSize: 12, padding: '3px 10px', borderRadius: 99, fontStyle: 'italic' }}>{msg.content}</span>
                    </div>
                  );

                  if (msg.type === 'calendar_invite' && msg.calendarData) {
                    const cd = msg.calendarData;
                    return (
                      <div key={msg.id} style={{ margin: '8px 0' }}>
                        <div style={{ background: 'white', border: '2px solid var(--polar)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 10px rgba(10,110,143,0.1)' }}>
                          <div style={{ background: 'linear-gradient(135deg, var(--midnight), var(--polar))', padding: '12px 16px', color: 'white' }}>
                            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '1px', opacity: 0.7, textTransform: 'uppercase', marginBottom: 3 }}>📅 Service Appointment</div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800 }}>{cd.serviceType}</div>
                          </div>
                          <div style={{ padding: '12px 16px' }}>
                            {[
                              { icon: '📅', label: 'Date', value: new Date(cd.confirmedDate).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                              { icon: '⏰', label: 'Time', value: cd.timeSlot === 'AM' ? 'Morning — 8:00 AM to 12:00 PM' : cd.timeSlot === 'PM' ? 'Afternoon — 1:00 PM to 5:00 PM' : 'Flexible' },
                              { icon: '🧑‍🔧', label: 'Technician', value: cd.technicianName },
                              { icon: '📍', label: 'Address', value: cd.address },
                            ].map(r => (
                              <div key={r.label} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                                <span style={{ flexShrink: 0, fontSize: 14 }}>{r.icon}</span>
                                <div>
                                  <div style={{ fontSize: 10, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</div>
                                  <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{r.value}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
                            {cd.accepted === undefined ? (
                              <div>
                                <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 8, textAlign: 'center' }}>Please confirm your appointment</div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                  <Button variant="secondary" size="sm" fullWidth onClick={() => handleRespondCalendar(msg.id, true)}>✓ Accept Appointment</Button>
                                  <Button variant="ghost" size="sm" fullWidth onClick={() => handleRespondCalendar(msg.id, false)}>↩ Request Reschedule</Button>
                                </div>
                              </div>
                            ) : cd.accepted ? (
                              <div style={{ textAlign: 'center', color: 'var(--verified)', fontWeight: 700, fontSize: 13 }}>✅ You confirmed this appointment</div>
                            ) : (
                              <div style={{ textAlign: 'center', color: 'var(--caution)', fontWeight: 700, fontSize: 13 }}>🔄 Reschedule requested — operator will follow up</div>
                            )}
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3 }}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 6 }}>
                      <div style={{ maxWidth: '75%' }}>
                        {!isMine && <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 3 }}>{msg.senderName}</div>}
                        <div style={{
                          background: isMine ? 'linear-gradient(135deg, var(--polar), var(--polar-dark))' : 'white',
                          color: isMine ? 'white' : 'var(--ink)',
                          border: isMine ? 'none' : '1px solid var(--border)',
                          borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          padding: '9px 13px', fontSize: 14, lineHeight: 1.5,
                          boxShadow: isMine ? '0 2px 8px rgba(10,110,143,0.2)' : 'var(--shadow-xs)',
                        }}>
                          {msg.content}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 2, textAlign: isMine ? 'right' : 'left' }}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder="Type a message… (Enter to send)"
                  rows={2}
                  style={{
                    flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--border)',
                    fontFamily: 'var(--font-body)', fontSize: 14, resize: 'none', outline: 'none', transition: 'border-color 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
                <Button variant="secondary" size="sm" onClick={handleSendMessage} disabled={!newMessage.trim()} style={{ flexShrink: 0 }}>Send</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default ClientDashboard;
