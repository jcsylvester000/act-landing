'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useStore, QUICK_REPLY_TEMPLATES } from '@/store';
import type { Job, Technician, Message, ServiceInvoice, BillingStatement } from '@/store';
import { Button, Badge, Card, StatCard, Modal, Select, Input, Toast } from '@/components/ui';
import InvoiceCard from '@/components/billing/InvoiceCard';
import BillingCard from '@/components/billing/BillingCard';
import ChatHistorySection from '@/components/chat/ChatHistory';
import { exportBillingCSV, exportJobsCSV, exportMonthlySummaryCSV } from '@/components/export/ExportUtils';

// ─── ADMIN SIDEBAR ────────────────────────────────────────────────────────────
const AdminSidebar: React.FC<{ active: string; onNav: (v: string) => void }> = ({ active, onNav }) => {
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;
  const { logout, notifications, markNotificationRead } = useStore();
  const router = useRouter();
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const adminNotifs = notifications.filter(n => n.userId === 'ADMIN001');
  const unreadNotifs = adminNotifs.filter(n => !n.read);
  const recentNotifs = adminNotifs.slice(0, 10);
  const navItems = [
    { key: 'dashboard', icon: '📊', label: 'Dashboard' },
    { key: 'jobs', icon: '📋', label: 'Job Queue' },
    { key: 'technicians', icon: '🧑‍🔧', label: 'Technicians' },
    { key: 'operators', icon: '🧑‍💼', label: 'Operators' },
    { key: 'schedule', icon: '📅', label: 'Schedule' },
    { key: 'clients', icon: '👥', label: 'Clients' },
    { key: 'followups', icon: '🔔', label: 'Follow-ups' },
    { key: 'messages', icon: '💬', label: 'Messages' },
    { key: 'finance', icon: '💰', label: 'Finance' },
    { key: 'accounting', icon: '🧾', label: 'Accounting' },
    { key: 'reviews', icon: '⭐', label: 'Reviews' },
    { key: 'catalog', icon: '🗂️', label: 'Service Catalog' },
    { key: 'settings', icon: '⚙️', label: 'Settings' },
  ];
  return (
    <aside style={{
      width: '100%', height: '100%',
      background: 'var(--midnight)',
      display: 'flex', flexDirection: isNarrow ? 'row' : 'column',
      overflowX: isNarrow ? 'auto' : 'hidden',
      overflowY: isNarrow ? 'hidden' : 'auto',
      flexShrink: 0,
    }}>
      <div className="admin-sidebar-header" style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: isNarrow ? 'none' : undefined }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo-act.png" alt="ACT" style={{ width: 40, height: 40, borderRadius: 10 }} />
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'white' }}>ACT<span style={{ color: 'var(--ember)' }}>.</span></div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Admin Panel</div>
            </div>
          </div>
          {/* Notification Bell */}
          <button onClick={() => setShowNotifPanel(p => !p)} style={{ position: 'relative', background: showNotifPanel ? 'rgba(91,196,214,0.2)' : 'transparent', border: '1.5px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', color: 'white', fontSize: 18, lineHeight: 1, display: 'flex', alignItems: 'center', transition: 'all 0.2s' }} title="Notifications">
            🔔
            {unreadNotifs.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 800, borderRadius: 99, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid var(--midnight)' }}>
                {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
              </span>
            )}
          </button>
        </div>
        {/* Notification Panel */}
        {showNotifPanel && (
          <div style={{ position: 'absolute', top: 88, left: 12, right: 12, background: '#1E293B', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200, overflow: 'hidden', maxHeight: 440, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'white', fontSize: 13, fontWeight: 700 }}>Notifications {unreadNotifs.length > 0 && <span style={{ background: '#EF4444', color: 'white', fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 99, marginLeft: 6 }}>{unreadNotifs.length}</span>}</span>
              {unreadNotifs.length > 0 && (
                <button onClick={() => unreadNotifs.forEach(n => markNotificationRead(n.id))} style={{ background: 'transparent', border: 'none', color: 'rgba(91,196,214,0.9)', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 600 }}>Mark all read</button>
              )}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {recentNotifs.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No notifications yet.</div>
              ) : recentNotifs.map(n => {
                const typeIcon = n.type === 'success' ? '✅' : n.type === 'warning' ? '⚠️' : n.type === 'error' ? '❌' : 'ℹ️';
                return (
                  <div key={n.id} style={{ padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: n.read ? 'transparent' : 'rgba(91,196,214,0.07)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{typeIcon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: n.read ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.9)', lineHeight: 1.5 }}>{n.message}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>{new Date(n.createdAt).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}</div>
                    </div>
                    {!n.read && (
                      <button onClick={() => markNotificationRead(n.id)} style={{ background: 'transparent', border: '1px solid rgba(91,196,214,0.4)', borderRadius: 6, color: 'rgba(91,196,214,0.9)', fontSize: 10, cursor: 'pointer', padding: '3px 7px', fontFamily: 'var(--font-body)', fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap' }}>Mark Read</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <nav className="admin-sidebar-nav" style={{ flex: 1, padding: isNarrow ? '8px 10px' : '16px 12px', display: 'flex', flexDirection: isNarrow ? 'row' : 'column', gap: isNarrow ? '2px' : '0', overflowX: isNarrow ? 'auto' : 'hidden' }}>
        {navItems.map(({ key, icon, label }) => (
          <button key={key} onClick={() => onNav(key)} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
            borderRadius: 10, marginBottom: 2, border: 'none', cursor: 'pointer',
            background: active === key ? 'rgba(91,196,214,0.15)' : 'transparent',
            color: active === key ? 'var(--frost)' : 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active === key ? 600 : 400,
            textAlign: 'left', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { if (active !== key) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { if (active !== key) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
            <span style={{ fontSize: 16 }}>{icon}</span> {label}
          </button>
        ))}
      </nav>
      <div className="admin-sidebar-footer" style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: isNarrow ? 'none' : undefined }}>
        <button onClick={() => { logout(); router.push('/'); }} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
          borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent',
          color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-body)', fontSize: 14,
        }}>🚪 Log Out</button>
      </div>
    </aside>
  );
};

// ─── OVERVIEW DASHBOARD ───────────────────────────────────────────────────────
const OverviewPanel: React.FC<{ jobs: Job[]; technicians: Technician[]; onNav: (v: string) => void }> = ({ jobs, technicians, onNav }) => {
  const today = new Date().toISOString().split('T')[0];
  const todayJobs = jobs.filter(j => j.preferredDate === today);
  const awaitingPayment = jobs.filter(j => j.paymentStatus === 'Awaiting Confirmation');
  const unassigned = jobs.filter(j => j.status === 'Pending' && !j.technicianId);
  const activeJobs = jobs.filter(j => j.status === 'Active');
  const lowRated = jobs.filter(j => j.rating && j.rating <= 3);
  const totalRevenue = jobs.filter(j => j.status === 'Completed').reduce((s, j) => s + j.totalPrice, 0);
  const recentJobs = [...jobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8);
  const needsAttention = awaitingPayment.length + unassigned.length;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Operations Dashboard</h2>
        <div style={{ fontSize: 13, color: 'var(--slate)' }}>
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Alert banner */}
      {needsAttention > 0 && (
        <div style={{ background: '#FEF3C7', border: '1.5px solid rgba(245,166,35,0.4)', borderRadius: 14, padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E' }}>{needsAttention} item{needsAttention !== 1 ? 's' : ''} need your attention</div>
              <div style={{ fontSize: 13, color: '#B45309' }}>
                {awaitingPayment.length > 0 && `${awaitingPayment.length} payment${awaitingPayment.length > 1 ? 's' : ''} to verify`}
                {awaitingPayment.length > 0 && unassigned.length > 0 && ' · '}
                {unassigned.length > 0 && `${unassigned.length} job${unassigned.length > 1 ? 's' : ''} without a technician`}
              </div>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => onNav('jobs')}>Go to Job Queue →</Button>
        </div>
      )}

      <div className="admin-kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Jobs Today" value={todayJobs.length} icon="📅" accent="var(--polar)" sub="Scheduled for today" />
        <StatCard label="Awaiting Payment" value={awaitingPayment.length} icon="⏳" accent="var(--caution)" sub="Screenshots to verify" />
        <StatCard label="Unassigned Jobs" value={unassigned.length} icon="🔴" accent="var(--alert)" sub="Need technician" />
        <StatCard label="Active Right Now" value={activeJobs.length} icon="🔧" accent="var(--polar)" sub="In progress" />
        <StatCard label="Low Ratings" value={lowRated.length} icon="⭐" accent="var(--alert)" sub="Needs follow-up" />
        <StatCard label="Total Revenue" value={`₱${(totalRevenue / 1000).toFixed(1)}k`} icon="💰" accent="var(--verified)" sub="Completed jobs" />
      </div>

      {/* Needs attention details */}
      {(awaitingPayment.length > 0 || unassigned.length > 0) && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--midnight)', marginBottom: 12 }}>🔔 Action Required</h3>
          {awaitingPayment.map(j => (
            <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--mist)', fontSize: 14, flexWrap: 'wrap' }}>
              <Badge label="Awaiting Confirmation" />
              <span style={{ fontWeight: 700 }}>{j.clientName}</span>
              <span style={{ color: 'var(--slate)' }}>{j.serviceType} · {j.city}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--polar)', marginLeft: 'auto' }}>₱{j.reservationFee.toLocaleString()}</span>
              <Button variant="ghost" size="sm" onClick={() => onNav('jobs')}>Review →</Button>
            </div>
          ))}
          {unassigned.map(j => (
            <div key={j.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--mist)', fontSize: 14, flexWrap: 'wrap' }}>
              <Badge label="Pending" />
              <span style={{ fontWeight: 700 }}>{j.clientName}</span>
              <span style={{ color: 'var(--slate)' }}>{j.preferredDate} · {j.city}</span>
              <span style={{ color: 'var(--alert)', fontWeight: 600, marginLeft: 'auto' }}>No technician</span>
              <Button variant="ghost" size="sm" onClick={() => onNav('jobs')}>Assign →</Button>
            </div>
          ))}
        </Card>
      )}

      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--midnight)' }}>Recent Jobs</h3>
          <Button variant="ghost" size="sm" onClick={() => onNav('jobs')}>View All Jobs →</Button>
        </div>
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--mist)' }}>
                {['Job ID', 'Client', 'Service', 'City', 'Date', 'Status', 'Payment'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentJobs.map(job => (
                <tr key={job.id} style={{ borderBottom: '1px solid var(--mist)', cursor: 'pointer' }}
                  onClick={() => onNav('jobs')}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cloud)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--polar)' }}>{job.id}</td>
                  <td style={{ padding: '12px', fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{job.clientName}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: 'var(--slate)' }}>{job.serviceType}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: 'var(--slate)' }}>{job.city}</td>
                  <td style={{ padding: '12px', fontSize: 13, color: 'var(--slate)' }}>{job.preferredDate}</td>
                  <td style={{ padding: '12px' }}><Badge label={job.status} /></td>
                  <td style={{ padding: '12px' }}><Badge label={job.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── JOBS PANEL ───────────────────────────────────────────────────────────────
const JobsPanel: React.FC<{ jobs: Job[]; technicians: Technician[]; onNav?: (panel: string) => void }> = ({ jobs, technicians, onNav }) => {
  const { updateJob, addNotification, users, addJob, serviceInvoices, billingStatements } = useStore();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [assignTech, setAssignTech] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [newBooking, setNewBooking] = useState<{ clientId: string; serviceType: string; city: string; preferredDate: string; specialInstructions: string }>({ clientId: '', serviceType: 'Basic Cleaning', city: 'Biñan', preferredDate: '', specialInstructions: '' });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const handleCreateBooking = () => {
    const client = users.find(u => u.id === newBooking.clientId);
    if (!client || !newBooking.preferredDate) return;
    addJob({
      clientId: client.id,
      clientName: `${client.firstName} ${client.lastName}`,
      serviceType: newBooking.serviceType as Job['serviceType'],
      acType: 'Split Type',
      numberOfUnits: 1,
      serviceAddress: client.address || '',
      city: newBooking.city as Job['city'],
      preferredDate: newBooking.preferredDate,
      timeSlot: 'AM',
      totalPrice: 0,
      reservationFee: 0,
      balanceDue: 0,
      paymentStatus: 'Unpaid',
      status: 'Pending',
      specialInstructions: newBooking.specialInstructions,
      requiresQuote: true,
      isAdminCreated: true,
    });
    showToast(`Booking created for ${client.firstName} ${client.lastName}!`);
    setShowNewBooking(false);
    setNewBooking({ clientId: '', serviceType: 'Basic Cleaning', city: 'Biñan', preferredDate: '', specialInstructions: '' });
  };

  const statuses = ['All', 'Pending', 'Awaiting Payment', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
  const byStatus = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);
  const filtered = search.trim()
    ? byStatus.filter(j =>
        j.clientName.toLowerCase().includes(search.toLowerCase()) ||
        j.id.toLowerCase().includes(search.toLowerCase()) ||
        j.city.toLowerCase().includes(search.toLowerCase())
      )
    : byStatus;

  const handleConfirmPayment = (job: Job) => {
    updateJob(job.id, { paymentStatus: 'Fee paid', status: 'Confirmed' });
    const client = users.find(u => u.id === job.clientId);
    if (client) addNotification({ userId: client.id, jobId: job.id, message: `Payment confirmed for job ${job.id}. Your booking is now confirmed!`, type: 'success', read: false });
    showToast('Payment confirmed!');
    setSelectedJob(null);
  };

  const handleAssignTech = (job: Job) => {
    const tech = technicians.find(t => t.id === assignTech);
    if (!tech) return;
    updateJob(job.id, { technicianId: tech.id, technicianName: tech.fullName, status: 'Confirmed' });
    const client = users.find(u => u.id === job.clientId);
    if (client) addNotification({
      userId: client.id, jobId: job.id,
      message: `Great news! ${tech.fullName} has been assigned to your booking ${job.id} on ${job.preferredDate}.`,
      type: 'success', read: false,
    });
    showToast(`${tech.fullName} assigned to ${job.id}`);
    setSelectedJob(null);
    setAssignTech('');
  };

  const handleMarkActive = (job: Job) => {
    updateJob(job.id, { status: 'Active' });
    const client = users.find(u => u.id === job.clientId);
    if (client) addNotification({ userId: client.id, jobId: job.id, message: `Your technician has arrived and service is underway for job ${job.id}.`, type: 'info', read: false });
    showToast('Job marked as Active — technician on-site.');
    setSelectedJob(null);
  };

  const handleMarkCompleted = (job: Job) => {
    updateJob(job.id, { status: 'Completed', paymentStatus: 'Fully paid', balanceDue: 0 });
    const client = users.find(u => u.id === job.clientId);
    if (client) addNotification({ userId: client.id, jobId: job.id, message: `Service for job ${job.id} is complete! Please leave a review.`, type: 'success', read: false });
    showToast('Job marked as completed!');
    setSelectedJob(null);
  };

  const handleCancelJob = (job: Job) => {
    updateJob(job.id, { status: 'Cancelled' });
    const client = users.find(u => u.id === job.clientId);
    if (client) addNotification({
      userId: client.id, jobId: job.id,
      message: `Your booking ${job.id} has been cancelled by ACT. Please contact us if you have questions.`,
      type: 'warning', read: false,
    });
    showToast('Job cancelled.');
    setSelectedJob(null);
  };

  return (
    <div>
      <Toast {...toast} />
      {/* Header + search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>
          Job Queue
          <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 600, color: 'var(--slate)' }}>({filtered.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <Button variant="primary" size="sm" onClick={() => setShowNewBooking(true)}>➕ New Booking</Button>
        {/* Search */}
        <input
          type="text"
          placeholder="🔍  Search by client, job ID, or city…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '9px 16px', borderRadius: 10, border: '1.5px solid var(--border)',
            fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)',
            background: 'white', outline: 'none', minWidth: 260,
            transition: 'border-color 0.2s',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
        />
        </div>
      </div>
      {/* Status filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {statuses.map(s => {
          const count = s === 'All' ? jobs.length : jobs.filter(j => j.status === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${filter === s ? 'var(--polar)' : 'var(--mist)'}`,
              background: filter === s ? 'var(--polar)' : 'white',
              color: filter === s ? 'white' : 'var(--slate)', fontFamily: 'var(--font-body)',
              position: 'relative',
            }}>
              {s} ({count})
            </button>
          );
        })}
      </div>

      <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--mist)' }}>
          <thead style={{ background: 'var(--cloud)' }}>
            <tr>
              {['Job ID', 'Client', 'Service', 'City', 'Date / Slot', 'Total', 'Payment', 'Status', 'Technician', 'Action'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--slate)', fontSize: 14 }}>
                  No jobs found{search ? ` matching "${search}"` : ''}.
                </td>
              </tr>
            ) : filtered.map(job => (
              <tr key={job.id} style={{ borderTop: '1px solid var(--mist)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cloud)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--polar)', whiteSpace: 'nowrap' }}>{job.id}</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{job.clientName}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--slate)', whiteSpace: 'nowrap' }}>{job.serviceType}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--slate)', whiteSpace: 'nowrap' }}>{job.city}</td>
                <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{job.preferredDate}<br /><span style={{ color: 'var(--slate)', fontSize: 11 }}>{job.timeSlot}</span></td>
                <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, whiteSpace: 'nowrap' }}>₱{job.totalPrice.toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}><Badge label={job.paymentStatus} /></td>
                <td style={{ padding: '12px 16px' }}><Badge label={job.status} /></td>
                <td style={{ padding: '12px 16px', fontSize: 13, color: job.technicianName ? 'var(--verified)' : 'var(--alert)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {job.technicianName || '— Unassigned'}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedJob(job)}>Manage</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── New Booking Modal ── */}
      <Modal open={showNewBooking} onClose={() => setShowNewBooking(false)} title="New Admin Booking" maxWidth={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: 'var(--slate)' }}>Create a booking on behalf of a client. A quote will be sent after the technician assesses on-site.</p>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Client</div>
            <select value={newBooking.clientId} onChange={e => setNewBooking(b => ({ ...b, clientId: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
              <option value="">Select client…</option>
              {users.filter(u => u.role === 'client').map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} — {u.phone}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Service Type</div>
            <select value={newBooking.serviceType} onChange={e => setNewBooking(b => ({ ...b, serviceType: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
              {(['Basic Cleaning', 'Deep Clean / Chemical Wash', 'AC Installation', 'Repair & Diagnostics', 'Refrigerant Recharge'] as const).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>City</div>
            <select value={newBooking.city} onChange={e => setNewBooking(b => ({ ...b, city: e.target.value }))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 14 }}>
              {(['Biñan', 'San Pedro', 'Sta. Rosa', 'Cabuyao', 'Muntinlupa', 'Carmona', 'GMA Cavite'] as const).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Input label="Preferred Date" type="date" value={newBooking.preferredDate} onChange={e => setNewBooking(b => ({ ...b, preferredDate: e.target.value }))} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--slate)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Special Instructions</div>
            <textarea value={newBooking.specialInstructions} onChange={e => setNewBooking(b => ({ ...b, specialInstructions: e.target.value }))} placeholder="Access notes, unit locations, client requests…" rows={3} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 14, resize: 'vertical', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" fullWidth onClick={() => setShowNewBooking(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleCreateBooking} disabled={!newBooking.clientId || !newBooking.preferredDate}>Create Booking</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!selectedJob} onClose={() => { setSelectedJob(null); setAssignTech(''); }} title={`Manage Job: ${selectedJob?.id}`} maxWidth={560}>
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Badge label={selectedJob.status} size="md" />
              <Badge label={selectedJob.paymentStatus} size="md" />
            </div>
            <div style={{ background: 'var(--cloud)', borderRadius: 12, padding: 16 }}>
              {([
                ['Client', selectedJob.clientName],
                ['Service', selectedJob.serviceType],
                ['AC Type', selectedJob.acType],
                ['Units', `${selectedJob.numberOfUnits} unit${selectedJob.numberOfUnits > 1 ? 's' : ''}`],
                ['City', selectedJob.city],
                ['Date', `${selectedJob.preferredDate} · ${selectedJob.timeSlot}`],
                ['Total', `₱${selectedJob.totalPrice.toLocaleString()}`],
                ['Balance', `₱${selectedJob.balanceDue.toLocaleString()}`],
                ...(selectedJob.technicianName ? [['Technician', selectedJob.technicianName]] : []),
                ...(selectedJob.specialInstructions ? [['Notes', selectedJob.specialInstructions]] : []),
              ] as [string, string | number][]).map(([l, v]) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                  <span style={{ color: 'var(--slate)' }}>{l}</span>
                  <span style={{ fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* ── Technician field notes (scope changes reported on-site) ── */}
            {selectedJob.techFieldNotes && (
              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: '#9A3412' }}>📋 Technician Field Notes</div>
                <p style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedJob.techFieldNotes}</p>
              </div>
            )}

            {/* ── Related accounting records (invoices + billing for this job) ── */}
            {(() => {
              const relInvoices = (serviceInvoices ?? []).filter(i => i.jobId === selectedJob.id);
              const relBilling = (billingStatements ?? []).filter(b => b.jobId === selectedJob.id);
              if (relInvoices.length === 0 && relBilling.length === 0) return null;
              return (
                <div style={{ background: '#F0F9FF', border: '1px solid #BAE6FD', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: '#0369A1' }}>🧾 Related Accounting Records</div>
                  {relInvoices.map(inv => (
                    <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>{inv.id}</span>
                      <span>Invoice · <strong>{inv.status}</strong></span>
                    </div>
                  ))}
                  {relBilling.map(bill => (
                    <div key={bill.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--slate)' }}>{bill.id}</span>
                      <span>Billing · <strong>{bill.status}</strong></span>
                    </div>
                  ))}
                  {onNav && (
                    <Button variant="secondary" fullWidth size="sm" style={{ marginTop: 8 }} onClick={() => { setSelectedJob(null); onNav('accounting'); }}>
                      Open in Accounting →
                    </Button>
                  )}
                </div>
              );
            })()}

            {/* ── Confirm payment ── */}
            {selectedJob.paymentStatus === 'Awaiting Confirmation' && (
              <div style={{ background: '#FEF3C7', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: '#92400E' }}>💳 Payment Screenshot Received</div>
                <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 12 }}>Review the client&apos;s screenshot and confirm the reservation fee payment.</p>
                <Button variant="secondary" fullWidth onClick={() => handleConfirmPayment(selectedJob)}>✓ Confirm Payment &amp; Approve Booking</Button>
              </div>
            )}

            {/* ── Assign / Reassign technician ── */}
            {!['Cancelled', 'Completed'].includes(selectedJob.status) && (
              <div style={{ background: selectedJob.technicianId ? '#EFF6FF' : '#FEE2E2', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: selectedJob.technicianId ? '#1E40AF' : '#991B1B' }}>
                  {selectedJob.technicianId ? '🔄 Reassign Technician' : '🔴 Assign Technician'}
                </div>
                {selectedJob.technicianName && (
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 8 }}>Current: <strong>{selectedJob.technicianName}</strong></div>
                )}
                <Select
                  label=""
                  value={assignTech}
                  onChange={e => setAssignTech(e.target.value)}
                  options={[
                    { value: '', label: 'Select available technician…' },
                    ...technicians
                      .filter(t => t.active && t.isAvailable)
                      .map(t => ({ value: t.id, label: `${t.fullName} · ${t.skillLevel} · ★${t.averageRating} · ${t.type}` })),
                  ]}
                />
                {technicians.filter(t => t.active && t.isAvailable).length === 0 && (
                  <p style={{ fontSize: 12, color: 'var(--alert)', marginTop: 8 }}>⚠️ No available technicians right now. Set a technician as Available in the Technicians panel.</p>
                )}
                <Button variant="danger" fullWidth style={{ marginTop: 10 }} onClick={() => handleAssignTech(selectedJob)} disabled={!assignTech}>Assign Technician</Button>
              </div>
            )}

            {/* ── Mark as Active (technician arrived) ── */}
            {['Confirmed', 'Scheduled'].includes(selectedJob.status) && selectedJob.technicianId && (
              <Button variant="secondary" fullWidth onClick={() => handleMarkActive(selectedJob)}>
                🔧 Mark as Active — Technician Arrived
              </Button>
            )}

            {/* ── Mark as Completed ── */}
            {selectedJob.status === 'Active' && (
              <Button variant="success" fullWidth onClick={() => handleMarkCompleted(selectedJob)}>
                ✓ Mark as Completed
              </Button>
            )}

            {/* ── Cancel job ── */}
            {!['Cancelled', 'Completed'].includes(selectedJob.status) && (
              <Button variant="danger" fullWidth onClick={() => handleCancelJob(selectedJob)} style={{ opacity: 0.8 }}>
                ✕ Cancel Job
              </Button>
            )}

            <Button variant="ghost" fullWidth onClick={() => setSelectedJob(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

// ─── TECHNICIANS PANEL ────────────────────────────────────────────────────────
const TechniciansPanel: React.FC<{ technicians: Technician[] }> = ({ technicians }) => {
  const { updateTechnician, addTechnician } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ fullName: '', phone: '', type: 'Outsourced', skillLevel: 'Junior', coverageCities: ['Biñan'] });

  const handleAdd = () => {
    addTechnician({ ...form as any, isAvailable: true, active: true, averageRating: 0, totalJobsCompleted: 0 });
    setShowAdd(false);
    setForm({ fullName: '', phone: '', type: 'Outsourced', skillLevel: 'Junior', coverageCities: ['Biñan'] });
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Technicians</h2>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Add Technician</Button>
      </div>
      <div className="admin-tech-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
        {technicians.map(tech => (
          <Card key={tech.id}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--polar)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
                  {tech.fullName[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{tech.fullName}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <Badge label={tech.type} size="sm" />
                    <Badge label={tech.skillLevel} size="sm" />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: tech.isAvailable ? 'var(--verified)' : 'var(--slate)' }} />
                <span style={{ fontSize: 12, color: tech.isAvailable ? 'var(--verified)' : 'var(--slate)' }}>{tech.isAvailable ? 'Available' : 'Busy'}</span>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'var(--cloud)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--caution)', fontFamily: 'var(--font-display)' }}>★ {tech.averageRating}</div>
                <div style={{ fontSize: 11, color: 'var(--slate)' }}>Avg Rating</div>
              </div>
              <div style={{ background: 'var(--cloud)', borderRadius: 10, padding: '10px 12px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--polar)', fontFamily: 'var(--font-display)' }}>{tech.totalJobsCompleted}</div>
                <div style={{ fontSize: 11, color: 'var(--slate)' }}>Jobs Done</div>
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 14 }}>
              {tech.coverageCities.join(' · ')}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" onClick={() => updateTechnician(tech.id, { isAvailable: !tech.isAvailable })}>
                {tech.isAvailable ? 'Set Busy' : 'Set Available'}
              </Button>
              {tech.active ? (
                <Button variant="danger" size="sm" onClick={() => updateTechnician(tech.id, { active: false })}>Deactivate</Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => updateTechnician(tech.id, { active: true })}>Reactivate</Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Technician">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Full Name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Mark Santos" />
          <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="09171234567" />
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            options={[{ value: 'Inhouse', label: 'Inhouse' }, { value: 'Outsource', label: 'Outsource' }]} />
          <Select label="Skill Level" value={form.skillLevel} onChange={e => setForm(f => ({ ...f, skillLevel: e.target.value }))}
            options={[{ value: 'Junior', label: 'Junior' }, { value: 'Senior', label: 'Senior' }, { value: 'Lead', label: 'Lead' }]} />
          <Button variant="primary" fullWidth onClick={handleAdd}>Add Technician</Button>
        </div>
      </Modal>
    </div>
  );
};

// ─── FINANCE PANEL ────────────────────────────────────────────────────────────
const FinancePanel: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  const { billingStatements } = useStore();
  const completed = jobs.filter(j => j.status === 'Completed');
  const totalRevenue = completed.reduce((s, j) => s + j.totalPrice, 0);
  const totalFees = (billingStatements ?? []).filter(b => b.status === 'Paid').reduce((s, b) => s + (b.amountPaidAtClose ?? 0), 0);
  const outstanding = completed.filter(j => j.paymentStatus === 'Fee paid').reduce((s, j) => s + j.balanceDue, 0);
  const collected = completed.filter(j => j.paymentStatus === 'Fully paid').reduce((s, j) => s + j.totalPrice, 0);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Finance Dashboard</h2>
        <Button variant="ghost" size="sm" onClick={() => exportJobsCSV(jobs)}>📥 Export Jobs CSV</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Total Revenue (Completed)" value={`₱${totalRevenue.toLocaleString()}`} icon="💰" accent="var(--polar)" />
        <StatCard label="Payments Received (Receipts)" value={`₱${totalFees.toLocaleString()}`} icon="✅" accent="var(--verified)" />
        <StatCard label="Outstanding Balances" value={`₱${outstanding.toLocaleString()}`} icon="⏳" accent="var(--caution)" />
        <StatCard label="Fully Collected" value={`₱${collected.toLocaleString()}`} icon="🏦" accent="var(--midnight)" />
      </div>

      <Card>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Completed Jobs — Financial Summary</h3>
        <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--mist)' }}>
                {['Job', 'Client', 'Service', 'Total', 'Res. Fee', 'Balance', 'Payment Status'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {completed.map(j => (
                <tr key={j.id} style={{ borderBottom: '1px solid var(--mist)' }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--polar)' }}>{j.id}</td>
                  <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 600 }}>{j.clientName}</td>
                  <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--slate)' }}>{j.serviceType}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>₱{j.totalPrice.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>₱{j.reservationFee.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13, color: j.balanceDue > 0 ? 'var(--caution)' : 'var(--verified)' }}>₱{j.balanceDue.toLocaleString()}</td>
                  <td style={{ padding: '10px 12px' }}><Badge label={j.paymentStatus} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ─── REVIEWS PANEL ────────────────────────────────────────────────────────────
const ReviewsPanel: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  const { sendMessage, updateJob } = useStore();
  const [reviewToast, setReviewToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const showReviewToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setReviewToast({ message: msg, type, visible: true }); setTimeout(() => setReviewToast(t => ({ ...t, visible: false })), 3000); };
  const reviewed = jobs.filter(j => j.rating);
  const avgRating = reviewed.length
    ? (reviewed.reduce((s, j) => s + (j.rating || 0), 0) / reviewed.length).toFixed(1)
    : 'N/A';
  const [filter, setFilter] = useState('All');
  const filtered = filter === 'Low' ? reviewed.filter(j => (j.rating || 0) <= 3) : reviewed;

  return (
    <div>
      <Toast {...reviewToast} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Reviews</h2>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--caution)' }}>★ {avgRating}</div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['All', 'Low'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 99, border: `1.5px solid ${filter === f ? 'var(--polar)' : 'var(--mist)'}`, background: filter === f ? 'var(--polar)' : 'white', color: filter === f ? 'white' : 'var(--slate)', fontFamily: 'var(--font-body)', fontSize: 13, cursor: 'pointer' }}>
            {f === 'All' ? 'All Reviews' : '⚠️ Low Ratings (≤ 3)'}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(job => (
          <Card key={job.id} style={{ border: (job.rating || 0) <= 3 ? '1.5px solid var(--alert)' : '1px solid var(--mist)', background: (job.rating || 0) <= 3 ? '#FFF5F5' : 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 2 }}>
                {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ color: i < (job.rating || 0) ? '#F5A623' : 'var(--mist)' }}>★</span>)}
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--slate)' }}>{job.id}</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--slate)', marginBottom: 12, fontStyle: 'italic' }}>&ldquo;{job.review || 'No comment'}&rdquo;</p>
            <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>{job.clientName}</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: (job.rating || 0) <= 3 ? 12 : 0 }}>{job.serviceType} · {job.preferredDate}</div>
            {(job.rating || 0) <= 3 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <Button variant="ghost" size="sm" onClick={() => {
                  sendMessage({ jobId: job.id, senderId: 'ADMIN001', senderName: 'ACT Admin', senderRole: 'admin', type: 'text', content: `Hi ${job.clientName.split(' ')[0]}! We noticed your recent experience with us didn't meet your expectations, and we sincerely apologize. Could you share more about what happened so we can make it right? Your feedback helps us improve. — ACT Team`, readBy: ['ADMIN001'] });
                  showReviewToast('Message sent to client!');
                }}>💬 Message Client</Button>
                <Button variant="ghost" size="sm" onClick={() => {
                  updateJob(job.id, { notes: (job.notes ? job.notes + ' | ' : '') + '⚠️ Low rating - under review' });
                  showReviewToast('Job flagged for review.');
                }}>🔖 Flag for Review</Button>
              </div>
            )}
          </Card>
        ))}
      </div>
      {filtered.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⭐</div>
          <p style={{ color: 'var(--slate)' }}>No reviews yet.</p>
        </Card>
      )}
    </div>
  );
};

// ─── SERVICE CATALOG PANEL ────────────────────────────────────────────────────
const CatalogPanel: React.FC = () => {
  const services = [
    { name: 'Basic Cleaning — Split Type', clientPrice: 1500, contractorRate: 1100, fee: 300, interval: 90, active: true },
    { name: 'Basic Cleaning — Window Type', clientPrice: 1200, contractorRate: 900, fee: 300, interval: 90, active: true },
    { name: 'Basic Cleaning — Cassette Type', clientPrice: 1800, contractorRate: 1300, fee: 300, interval: 90, active: true },
    { name: 'Deep Clean / Chemical Wash — Split Type', clientPrice: 2500, contractorRate: 1800, fee: 500, interval: 180, active: true },
    { name: 'Deep Clean / Chemical Wash — Window Type', clientPrice: 2000, contractorRate: 1400, fee: 500, interval: 180, active: true },
    { name: 'Deep Clean / Chemical Wash — Cassette Type', clientPrice: 3000, contractorRate: 2200, fee: 500, interval: 180, active: true },
    { name: 'Freon Recharge', clientPrice: 4000, contractorRate: 2500, fee: 500, interval: 0, active: true },
    { name: 'Diagnostics', clientPrice: 1200, contractorRate: 750, fee: 300, interval: 0, active: true },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 24 }}>Service Catalog</h2>
      <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--mist)' }}>
          <thead style={{ background: 'var(--cloud)' }}>
            <tr>
              {['Service', 'Client Price', 'Contractor Rate', 'ACT Margin', 'Margin %', 'Res. Fee', 'Follow-up', 'Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {services.map(s => {
              const margin = s.clientPrice - s.contractorRate;
              const marginPct = Math.round((margin / s.clientPrice) * 100);
              return (
                <tr key={s.name} style={{ borderTop: '1px solid var(--mist)' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--polar)' }}>₱{s.clientPrice.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--slate)' }}>₱{s.contractorRate.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--verified)' }}>₱{margin.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--verified)', fontWeight: 700 }}>{marginPct}%</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>₱{s.fee}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--slate)' }}>{s.interval > 0 ? `${s.interval} days` : 'As needed'}</td>
                  <td style={{ padding: '12px 16px' }}><Badge label="Active" color="var(--verified)" bg="#D1FAE5" /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── CLIENTS PANEL ────────────────────────────────────────────────────────────
const ClientsPanel: React.FC = () => {
  const { users, jobs, sendMessage } = useStore();
  const clients = users.filter(u => u.role === 'client');
  const [selectedClient, setSelectedClient] = useState<(typeof users)[0] | null>(null);
  const [clientToast, setClientToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const showClientToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setClientToast({ message: msg, type, visible: true }); setTimeout(() => setClientToast(t => ({ ...t, visible: false })), 3000); };

  return (
    <div>
      <Toast {...clientToast} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 24 }}>Clients</h2>
      <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--mist)' }}>
          <thead style={{ background: 'var(--cloud)' }}>
            <tr>
              {['Name', 'Phone', 'Email', 'City', 'Type', 'Jobs', 'Last Service', 'Follow-up Status'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(c => {
              const clientJobs = jobs.filter(j => j.clientId === c.id);
              return (
                <tr key={c.id} style={{ borderTop: '1px solid var(--mist)', cursor: 'pointer' }}
                  onClick={() => setSelectedClient(c)}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cloud)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>{c.firstName} {c.lastName}</td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--slate)' }}>{c.phone}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--slate)' }}>{c.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.city || '—'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13 }}>{c.clientType || 'Residential'}</td>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: 'var(--polar)' }}>{clientJobs.length}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--slate)' }}>{c.lastServiceDate || '—'}</td>
                  <td style={{ padding: '12px 16px' }}><Badge label={c.followUpStatus || 'On track'} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Client Detail Modal */}
      <Modal open={!!selectedClient} onClose={() => setSelectedClient(null)} title={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ''} maxWidth={560}>
        {selectedClient && (() => {
          const clientJobs = jobs.filter(j => j.clientId === selectedClient.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          const totalSpent = clientJobs.filter(j => j.status === 'Completed').reduce((s, j) => s + j.totalPrice, 0);
          const lastJob = clientJobs[0];
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Client info */}
              <div style={{ background: 'var(--cloud)', borderRadius: 12, padding: 14 }}>
                {([
                  ['Phone', selectedClient.phone],
                  ['Email', selectedClient.email],
                  ['City', selectedClient.city || '—'],
                  ['Type', selectedClient.clientType || 'Residential'],
                  ['Lead Source', (selectedClient as any).leadSource || '—'],
                  ['Follow-up', selectedClient.followUpStatus || 'On track'],
                ] as [string, string][]).map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                    <span style={{ color: 'var(--slate)' }}>{l}</span>
                    <span style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--mist)', fontSize: 14 }}>
                  <span style={{ color: 'var(--slate)' }}>Total Spent</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--verified)' }}>₱{totalSpent.toLocaleString()}</span>
                </div>
              </div>
              {/* Job history */}
              {clientJobs.length > 0 ? (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 8 }}>Job History ({clientJobs.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                    {clientJobs.map(j => (
                      <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--cloud)', borderRadius: 10, fontSize: 13, flexWrap: 'wrap', gap: 6 }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{j.serviceType}</div>
                          <div style={{ fontSize: 12, color: 'var(--slate)' }}>{j.preferredDate} · {j.city}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>₱{j.totalPrice.toLocaleString()}</div>
                          <Badge label={j.status} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--slate)', textAlign: 'center' }}>No jobs yet.</p>
              )}
              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                {lastJob && (
                  <Button variant="secondary" fullWidth onClick={() => {
                    sendMessage({ jobId: lastJob.id, senderId: 'ADMIN001', senderName: 'ACT Admin', senderRole: 'admin', type: 'text', content: `Hi ${selectedClient.firstName}! This is ACT Aircon Service. How can we help you today?`, readBy: ['ADMIN001'] });
                    showClientToast('Message sent!');
                    setSelectedClient(null);
                  }}>💬 Message Client</Button>
                )}
                <Button variant="ghost" fullWidth onClick={() => setSelectedClient(null)}>Close</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

// ─── FOLLOW-UPS PANEL ─────────────────────────────────────────────────────────
const FollowUpsPanel: React.FC = () => {
  const { users, jobs, sendMessage, updateUser } = useStore();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setToast({ message: msg, type, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };
  const today = new Date();
  const overdueClients = users.filter(u => u.role === 'client' && u.nextDueDate && new Date(u.nextDueDate) <= today && u.followUpStatus !== 'Converted');
  return (
    <div>
      <Toast {...toast} />
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 24 }}>Follow-ups</h2>
      {overdueClients.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <p style={{ color: 'var(--slate)' }}>No overdue follow-ups right now.</p>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {overdueClients.map(c => {
            const daysOverdue = Math.floor((today.getTime() - new Date(c.nextDueDate!).getTime()) / (1000 * 60 * 60 * 24));
            return (
              <Card key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--alert)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>{c.firstName[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{c.firstName} {c.lastName}</div>
                    <div style={{ fontSize: 13, color: 'var(--slate)' }}>{c.phone} · {c.city}</div>
                    <div style={{ fontSize: 12, color: 'var(--alert)', marginTop: 2 }}>⚠️ {daysOverdue} days overdue</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="secondary" size="sm" onClick={() => {
                    const clientJobs = jobs.filter(j => j.clientId === c.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const lastJob = clientJobs[0];
                    const jobId = lastJob?.id || 'GENERAL';
                    sendMessage({ jobId: jobId, senderId: 'ADMIN001', senderName: 'ACT Admin', senderRole: 'admin', type: 'text', content: `Hi ${c.firstName}! 👋 It's been a while since your last AC service. We wanted to check in — is everything running smoothly? If you're due for a maintenance check, we'd love to schedule one for you. Let us know! — ACT Team`, readBy: ['ADMIN001'] });
                    showToast('Reminder sent via Messages!', 'success');
                  }}>Send Reminder</Button>
                  <Button variant="ghost" size="sm" onClick={() => { updateUser(c.id, { followUpStatus: 'Converted' }); showToast(`${c.firstName} marked as converted!`); }}>Mark Converted</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── SCHEDULE PANEL ───────────────────────────────────────────────────────────
const SchedulePanel: React.FC<{ jobs: Job[]; technicians: Technician[] }> = ({ jobs, technicians }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 24 }}>Weekly Schedule</h2>
      <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--mist)', minWidth: 800 }}>
          <thead>
            <tr style={{ background: 'var(--midnight)' }}>
              <th style={{ padding: '14px 16px', textAlign: 'left', color: 'white', fontSize: 13, fontWeight: 700, minWidth: 150 }}>Technician</th>
              {days.map(d => (
                <th key={d.toDateString()} style={{ padding: '14px 16px', textAlign: 'center', color: 'white', fontSize: 12, fontWeight: 600, minWidth: 100 }}>
                  {d.toLocaleDateString('en-PH', { weekday: 'short' })}<br />
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {technicians.filter(t => t.active).map(tech => (
              <tr key={tech.id} style={{ borderTop: '1px solid var(--mist)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{tech.fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--slate)' }}>{tech.type} · {tech.skillLevel}</div>
                </td>
                {days.map(d => {
                  const dateStr = d.toISOString().split('T')[0];
                  const dayJobs = jobs.filter(j => j.technicianId === tech.id && j.preferredDate === dateStr && j.status !== 'Cancelled');
                  return (
                    <td key={dateStr} style={{ padding: '8px', textAlign: 'center' }}>
                      {dayJobs.length === 0 ? (
                        <span style={{ fontSize: 11, color: 'var(--mist)' }}>—</span>
                      ) : (
                        dayJobs.map(j => (
                          <div key={j.id} style={{
                            background: j.status === 'Completed' ? '#D1FAE5' : j.status === 'Active' ? '#DBEAFE' : 'var(--breeze)',
                            border: `1px solid ${j.status === 'Completed' ? '#86EFAC' : 'var(--mist)'}`,
                            borderRadius: 8, padding: '4px 8px', fontSize: 11, fontWeight: 600,
                            color: j.status === 'Completed' ? '#065F46' : 'var(--polar)', marginBottom: 2,
                          }}>
                            {j.serviceType.split(' ')[0]}<br />{j.timeSlot}
                          </div>
                        ))
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ─── OPERATORS PANEL ─────────────────────────────────────────────────────────
const OperatorsPanel: React.FC = () => {
  const { users, addOperator, updateOperator } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', assignedCities: '' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message: msg, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const operators = users.filter(u => u.role === 'operator');
  const activeCount = operators.filter(u => u.operatorStatus !== 'Inactive').length;

  const handleAdd = () => {
    const cities = form.assignedCities.split(',').map(s => s.trim()).filter(Boolean);
    addOperator({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, assignedCities: cities });
    setShowAdd(false);
    setForm({ firstName: '', lastName: '', email: '', phone: '', assignedCities: '' });
    showToast('Operator added successfully!');
  };

  return (
    <div>
      <Toast {...toast} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Operators</h2>
        <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>+ Add Operator</Button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Operators" value={operators.length} icon="🧑‍💼" accent="var(--polar)" sub="All registered" />
        <StatCard label="Active Operators" value={activeCount} icon="✅" accent="var(--verified)" sub="Currently active" />
      </div>

      {operators.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧑‍💼</div>
          <p style={{ color: 'var(--slate)' }}>No operators yet. Add one to get started.</p>
        </Card>
      ) : (
        <div className="admin-tech-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {operators.map(op => {
            const isActive = op.operatorStatus !== 'Inactive';
            const assignedCities: string[] = op.assignedCities || [];
            return (
              <Card key={op.id}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--polar)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>
                      {op.firstName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{op.firstName} {op.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{op.email}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate)' }}>{op.phone}</div>
                    </div>
                  </div>
                  <Badge label={isActive ? 'Active' : 'Inactive'} color={isActive ? 'var(--verified)' : 'var(--slate)'} bg={isActive ? '#D1FAE5' : '#F3F4F6'} />
                </div>

                {assignedCities.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                    {assignedCities.map(city => (
                      <span key={city} style={{ background: 'var(--breeze)', color: 'var(--polar)', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 99 }}>{city}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <Button variant={isActive ? 'danger' : 'secondary'} size="sm"
                    onClick={() => { updateOperator(op.id, { operatorStatus: isActive ? 'Inactive' : 'Active' }); showToast(`Operator ${isActive ? 'deactivated' : 'activated'}.`); }}>
                    {isActive ? 'Set Inactive' : 'Set Active'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Operator">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="First Name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} placeholder="Juan" />
          <Input label="Last Name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} placeholder="dela Cruz" />
          <Input label="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="juan@example.com" />
          <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="09171234567" />
          <Input label="Assigned Cities (comma-separated)" value={form.assignedCities} onChange={e => setForm(f => ({ ...f, assignedCities: e.target.value }))} placeholder="Biñan, San Pedro, Sta. Rosa" />
          <Button variant="primary" fullWidth onClick={handleAdd} disabled={!form.firstName || !form.lastName || !form.email}>Add Operator</Button>
        </div>
      </Modal>
    </div>
  );
};

// ─── MESSAGES HUB — replaces third-party comms (Messenger / text / calls) ────
// Unified admin inbox: all job threads, quick-reply templates, tech availability check

const MessagesMonitorPanel: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  const { messages, users, technicians, currentUser, sendMessage, updateJob, markMessagesRead } = useStore();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [threadFilter, setThreadFilter] = useState<'all' | 'unread' | 'active'>('all');
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [qrCategory, setQrCategory] = useState<string>('all');
  const [showTechCheck, setShowTechCheck] = useState(false);
  const [showCalInvite, setShowCalInvite] = useState(false);
  const [calDate, setCalDate] = useState('');
  const [calTime, setCalTime] = useState<'AM' | 'PM' | 'Flexible'>('AM');
  const [calTechId, setCalTechId] = useState('');
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const ADMIN_ID = 'ADMIN001';

  const showToast = (msg: string) => { setToast({ message: msg, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 2500); };

  // Build thread list: all jobs with messages + active/pending jobs without messages yet
  const activeJobIds = jobs.filter(j => !['Completed', 'Cancelled'].includes(j.status)).map(j => j.id);
  const jobsWithMessages = jobs.filter(j => messages.some(m => m.jobId === j.id));
  const allThreadJobs = [...new Map([...jobsWithMessages, ...jobs.filter(j => activeJobIds.includes(j.id))].map(j => [j.id, j])).values()]
    .sort((a, b) => {
      const aLast = messages.filter(m => m.jobId === a.id).slice(-1)[0]?.createdAt || a.createdAt;
      const bLast = messages.filter(m => m.jobId === b.id).slice(-1)[0]?.createdAt || b.createdAt;
      return new Date(bLast).getTime() - new Date(aLast).getTime();
    });

  const unreadForJob = (jobId: string) =>
    messages.filter(m => m.jobId === jobId && !m.readBy?.includes(ADMIN_ID)).length;
  const totalUnread = allThreadJobs.reduce((s, j) => s + unreadForJob(j.id), 0);

  const filteredThreadJobs = allThreadJobs.filter(j => {
    if (threadFilter === 'unread') return unreadForJob(j.id) > 0;
    if (threadFilter === 'active') return !['Completed', 'Cancelled'].includes(j.status);
    return true;
  });

  const selectedJob = jobs.find(j => j.id === selectedJobId) || null;
  const threadMessages: Message[] = selectedJobId
    ? messages.filter(m => m.jobId === selectedJobId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    : [];

  // Mark messages as read when thread is selected
  React.useEffect(() => {
    if (selectedJobId) markMessagesRead(selectedJobId, ADMIN_ID);
  }, [selectedJobId, markMessagesRead]);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length]);

  const lastMessageForJob = (jobId: string): Message | undefined => {
    const jobMsgs = messages.filter(m => m.jobId === jobId);
    if (!jobMsgs.length) return undefined;
    return jobMsgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedJobId) return;
    sendMessage({ jobId: selectedJobId, senderId: ADMIN_ID, senderName: 'ACT Admin', senderRole: 'admin', type: 'text', content: newMessage.trim(), readBy: [ADMIN_ID] });
    setNewMessage('');
    setShowQuickReplies(false);
  };

  // Quick reply template variable substitution
  const applyTemplate = (template: string) => {
    if (!selectedJob) return template;
    const client = users.find(u => u.id === selectedJob.clientId);
    const tech = technicians.find(t => t.id === selectedJob.technicianId);
    return template
      .replace(/{{clientName}}/g, client?.firstName || selectedJob.clientName.split(' ')[0])
      .replace(/{{techName}}/g, tech?.fullName || selectedJob.technicianName || 'our technician')
      .replace(/{{date}}/g, selectedJob.preferredDate)
      .replace(/{{time}}/g, selectedJob.timeSlot)
      .replace(/{{service}}/g, selectedJob.serviceType)
      .replace(/{{city}}/g, selectedJob.city)
      .replace(/{{amount}}/g, selectedJob.balanceDue.toLocaleString());
  };

  // Send calendar invite
  const handleSendCalInvite = () => {
    if (!selectedJobId || !calDate || !calTechId) return;
    const tech = technicians.find(t => t.id === calTechId);
    if (!tech || !selectedJob) return;
    sendMessage({
      jobId: selectedJobId, senderId: ADMIN_ID, senderName: 'ACT Admin', senderRole: 'admin',
      type: 'calendar_invite',
      content: 'Calendar invite sent. Please accept to confirm your schedule.',
      calendarData: { confirmedDate: calDate, timeSlot: calTime, technicianName: tech.fullName, address: selectedJob.serviceAddress + ', ' + selectedJob.city, serviceType: selectedJob.serviceType + (selectedJob.numberOfUnits > 1 ? ` — ${selectedJob.numberOfUnits} units` : '') },
      readBy: [ADMIN_ID],
    });
    updateJob(selectedJobId, { technicianId: calTechId, technicianName: tech.fullName, status: 'Confirmed', preferredDate: calDate });
    setShowCalInvite(false); setCalDate(''); setCalTechId('');
    showToast('Calendar invite sent & technician assigned!');
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true });
  const formatDate = (iso: string) => {
    const d = new Date(iso); const today = new Date(); const yest = new Date(); yest.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Today';
    if (d.toDateString() === yest.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const renderBubble = (msg: Message) => {
    const isAdminOp = msg.senderRole === 'admin' || msg.senderRole === 'operator';
    const isClient = msg.senderRole === 'client';
    if (msg.type === 'system') return (
      <div key={msg.id} style={{ textAlign: 'center', margin: '8px 0' }}>
        <span style={{ background: 'var(--cloud)', color: 'var(--slate)', fontSize: 12, padding: '4px 14px', borderRadius: 99, border: '1px solid var(--mist)' }}>{msg.content}</span>
      </div>
    );
    if (msg.type === 'calendar_invite' && msg.calendarData) {
      const inv = msg.calendarData;
      return (
        <div key={msg.id} style={{ display: 'flex', justifyContent: isAdminOp ? 'flex-end' : 'flex-start', margin: '6px 0' }}>
          <div style={{ background: 'white', border: '2px solid var(--polar)', borderRadius: 14, padding: '14px 18px', maxWidth: 340, fontSize: 13, boxShadow: '0 2px 12px rgba(10,110,143,0.1)' }}>
            <div style={{ fontWeight: 700, color: 'var(--polar)', marginBottom: 8, fontSize: 14 }}>📅 Schedule Confirmation</div>
            <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '4px 12px', fontSize: 13, marginBottom: 10 }}>
              <span style={{ color: 'var(--slate)' }}>Date</span><span style={{ fontWeight: 600 }}>{inv.confirmedDate}</span>
              <span style={{ color: 'var(--slate)' }}>Time</span><span style={{ fontWeight: 600 }}>{inv.timeSlot}</span>
              <span style={{ color: 'var(--slate)' }}>Technician</span><span style={{ fontWeight: 600 }}>{inv.technicianName}</span>
              <span style={{ color: 'var(--slate)' }}>Service</span><span style={{ fontWeight: 600 }}>{inv.serviceType}</span>
            </div>
            <Badge label={inv.accepted === true ? '✓ Accepted' : inv.accepted === false ? '✕ Declined' : '⏳ Awaiting response'} color={inv.accepted === true ? 'var(--verified)' : inv.accepted === false ? 'var(--alert)' : 'var(--caution)'} bg={inv.accepted === true ? '#D1FAE5' : inv.accepted === false ? '#FEE2E2' : '#FEF3C7'} />
            <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 8 }}>{msg.senderName} · {formatTime(msg.createdAt)}</div>
          </div>
        </div>
      );
    }
    if (msg.type === 'status_update') return (
      <div key={msg.id} style={{ display: 'flex', justifyContent: isAdminOp ? 'flex-end' : 'flex-start', margin: '4px 0' }}>
        <div style={{ background: 'linear-gradient(135deg, var(--verified), #059669)', color: 'white', borderRadius: isAdminOp ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', maxWidth: 340, fontSize: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, opacity: 0.85 }}>📍 Status Update · {msg.senderName}</div>
          <div>{msg.content}</div>
          <div style={{ fontSize: 10, marginTop: 6, opacity: 0.7, textAlign: 'right' }}>{formatTime(msg.createdAt)}</div>
        </div>
      </div>
    );
    return (
      <div key={msg.id} style={{ display: 'flex', justifyContent: isAdminOp ? 'flex-end' : 'flex-start', margin: '4px 0' }}>
        <div style={{ background: msg.senderRole === 'admin' ? 'var(--midnight)' : msg.senderRole === 'operator' ? 'var(--polar)' : 'white', color: isAdminOp ? 'white' : 'var(--ink)', border: isClient ? '1px solid var(--mist)' : 'none', borderRadius: isAdminOp ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '10px 14px', maxWidth: 360, fontSize: 14, lineHeight: 1.5 }}>
          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, opacity: 0.75 }}>{msg.senderName}</div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
          <div style={{ fontSize: 10, marginTop: 6, opacity: 0.6, textAlign: 'right' }}>{formatTime(msg.createdAt)}</div>
        </div>
      </div>
    );
  };

  const qrCategories = ['all', 'greeting', 'availability', 'confirmation', 'dispatch', 'update', 'payment', 'completion'];
  const filteredTemplates = QUICK_REPLY_TEMPLATES.filter(t => qrCategory === 'all' || t.category === qrCategory);
  const availableTechs = technicians.filter(t => t.active && t.isAvailable && (!selectedJob || t.coverageCities.includes(selectedJob.city as never)));

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 4 }}>Messages Hub</h2>
          <p style={{ color: 'var(--slate)', fontSize: 14 }}>
            All client communication — in one place.
            {totalUnread > 0 && <span style={{ marginLeft: 8, background: 'var(--alert)', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99 }}>{totalUnread} unread</span>}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'unread', 'active'] as const).map(f => (
            <button key={f} onClick={() => setThreadFilter(f)} style={{ padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${threadFilter === f ? 'var(--polar)' : 'var(--mist)'}`, background: threadFilter === f ? 'var(--polar)' : 'white', color: threadFilter === f ? 'white' : 'var(--slate)', fontFamily: 'var(--font-body)' }}>
              {f === 'all' ? 'All Threads' : f === 'unread' ? `Unread${totalUnread > 0 ? ` (${totalUnread})` : ''}` : 'Active Jobs'}
            </button>
          ))}
        </div>
      </div>

      {/* Note card nudging admin to keep comms in-platform */}
      <div style={{ background: 'linear-gradient(135deg, #e0f2fe, #f0fdf4)', border: '1px solid #bae6fd', borderRadius: 12, padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
        <div style={{ fontSize: 13, color: 'var(--ink)' }}>
          <strong>Keep all communication here</strong> — instead of Messenger or text, send client updates, calendar invites, and payment reminders directly in this inbox. Clients get notifications and can reply right from their dashboard.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 0, background: 'white', borderRadius: 16, border: '1px solid var(--mist)', overflow: 'hidden', minHeight: 600 }}>
        {/* ── Left pane: thread list ── */}
        <div style={{ width: 300, flexShrink: 0, borderRight: '1px solid var(--mist)', overflowY: 'auto', background: 'var(--cloud)' }}>
          {filteredThreadJobs.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--slate)', fontSize: 14 }}>No threads match this filter.</div>
          ) : filteredThreadJobs.map(job => {
            const last = lastMessageForJob(job.id);
            const unread = unreadForJob(job.id);
            const isSelected = selectedJobId === job.id;
            const isPending = job.status === 'Pending';
            return (
              <button key={job.id} onClick={() => setSelectedJobId(job.id)} style={{ width: '100%', textAlign: 'left', padding: '14px 16px', border: 'none', cursor: 'pointer', background: isSelected ? 'white' : 'transparent', borderBottom: '1px solid var(--mist)', borderLeft: isSelected ? `3px solid var(--polar)` : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <span style={{ fontWeight: unread > 0 ? 800 : 700, fontSize: 14, color: 'var(--ink)' }}>{job.clientName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    {last && <span style={{ fontSize: 10, color: 'var(--slate)' }}>{formatDate(last.createdAt)}</span>}
                    {unread > 0 && <span style={{ background: 'var(--alert)', color: 'white', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 99 }}>{unread}</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, background: isPending ? '#FEF3C7' : isSelected ? 'var(--breeze)' : '#E0F2FE', color: isPending ? '#92400E' : 'var(--polar)', padding: '1px 7px', borderRadius: 99, fontWeight: 700 }}>{job.status}</span>
                  <span style={{ fontSize: 11, color: 'var(--slate)' }}>{job.city}</span>
                  {job.requiresQuote && <span style={{ fontSize: 10, background: '#FDE8D8', color: 'var(--ember)', padding: '1px 7px', borderRadius: 99, fontWeight: 700 }}>Quote</span>}
                </div>
                {last ? (
                  <div style={{ fontSize: 12, color: unread > 0 ? 'var(--ink)' : 'var(--slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240 }}>
                    {last.senderRole === 'client' ? '← ' : ''}<strong>{last.senderRole === 'client' ? 'Client' : 'ACT'}</strong>: {last.content.slice(0, 60)}{last.content.length > 60 ? '…' : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--slate)', fontStyle: 'italic' }}>No messages yet — start the conversation</div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Right pane: chat ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!selectedJob ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', padding: 40, textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--midnight)', marginBottom: 8 }}>Select a thread</div>
              <div style={{ fontSize: 14, maxWidth: 320, lineHeight: 1.6 }}>Choose a job conversation on the left. Use quick reply templates to replace your Messenger messages — all communication stays recorded here.</div>
            </div>
          ) : (
            <>
              {/* Job context banner */}
              <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--mist)', background: 'white', flexShrink: 0 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--midnight)' }}>{selectedJob.clientName}</div>
                    <Badge label={selectedJob.status} />
                    <span style={{ fontSize: 12, color: 'var(--slate)' }}>{selectedJob.serviceType} · {selectedJob.city} · {selectedJob.preferredDate}</span>
                    {selectedJob.technicianName && <span style={{ fontSize: 12, background: '#D1FAE5', color: '#065F46', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>Tech: {selectedJob.technicianName}</span>}
                    {selectedJob.requiresQuote && <span style={{ fontSize: 12, background: '#FDE8D8', color: 'var(--ember)', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>⚡ Needs Quote</span>}
                    {selectedJob.preferredTechnicianName && !selectedJob.technicianName && <span style={{ fontSize: 12, background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: 99, fontWeight: 700 }}>Prefers: {selectedJob.preferredTechnicianName}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {/* Tech availability check — for pending/confirmed jobs */}
                    {['Pending', 'Confirmed', 'Scheduled'].includes(selectedJob.status) && (
                      <button onClick={() => { setShowTechCheck(!showTechCheck); setShowCalInvite(false); setShowQuickReplies(false); }} style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${showTechCheck ? 'var(--polar)' : 'var(--mist)'}`, background: showTechCheck ? 'var(--breeze)' : 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: showTechCheck ? 'var(--polar)' : 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                        🔍 Check Techs
                      </button>
                    )}
                    {/* Send calendar invite */}
                    {['Pending', 'Confirmed', 'Scheduled'].includes(selectedJob.status) && (
                      <button onClick={() => { setShowCalInvite(!showCalInvite); setShowTechCheck(false); setShowQuickReplies(false); setCalDate(selectedJob.preferredDate); setCalTime(selectedJob.timeSlot); }} style={{ padding: '6px 12px', borderRadius: 8, border: `1.5px solid ${showCalInvite ? 'var(--polar)' : 'var(--mist)'}`, background: showCalInvite ? 'var(--breeze)' : 'white', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: showCalInvite ? 'var(--polar)' : 'var(--ink)', fontFamily: 'var(--font-body)' }}>
                        📅 Calendar Invite
                      </button>
                    )}
                  </div>
                </div>

                {/* Tech availability check drawer */}
                {showTechCheck && (
                  <div style={{ marginTop: 12, padding: 14, background: 'var(--cloud)', borderRadius: 10, border: '1px solid var(--mist)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 10 }}>Available technicians for {selectedJob.city}</div>
                    {availableTechs.length === 0 ? (
                      <div style={{ fontSize: 13, color: 'var(--slate)' }}>No available techs covering {selectedJob.city}. Check individual schedules or update tech coverage.</div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {availableTechs.map(tech => (
                          <div key={tech.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'white', borderRadius: 8, border: `1.5px solid ${selectedJob.technicianId === tech.id ? 'var(--verified)' : 'var(--mist)'}` }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 13 }}>{tech.fullName} <span style={{ fontWeight: 400, color: 'var(--slate)', fontSize: 12 }}>· {tech.skillLevel} · ⭐{tech.averageRating}</span></div>
                              <div style={{ fontSize: 12, color: 'var(--slate)' }}>{tech.coverageCities.join(', ')}</div>
                              {selectedJob.preferredTechnicianId === tech.id && <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 700, marginTop: 2 }}>★ Client&apos;s preferred technician</div>}
                            </div>
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: 'var(--verified)', fontWeight: 700 }}>✓ Available</span>
                              {selectedJob.technicianId !== tech.id && (
                                <button onClick={() => {
                                  updateJob(selectedJob.id, { technicianId: tech.id, technicianName: tech.fullName });
                                  const client = users.find(u => u.id === selectedJob.clientId);
                                  sendMessage({ jobId: selectedJob.id, senderId: ADMIN_ID, senderName: 'ACT Admin', senderRole: 'admin', type: 'text', content: `Hi ${client?.firstName || selectedJob.clientName.split(' ')[0]}! Great news — ${tech.fullName} is confirmed for your ${selectedJob.serviceType} on ${selectedJob.preferredDate} (${selectedJob.timeSlot}). I'll send the official schedule confirmation now.`, readBy: [ADMIN_ID] });
                                  setShowTechCheck(false); showToast(`${tech.fullName} assigned!`);
                                }} style={{ padding: '5px 12px', borderRadius: 8, background: 'var(--polar)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)' }}>
                                  Assign & Notify Client
                                </button>
                              )}
                              {selectedJob.technicianId === tech.id && <span style={{ fontSize: 12, background: '#D1FAE5', color: '#065F46', padding: '3px 8px', borderRadius: 99, fontWeight: 700 }}>Assigned</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Calendar invite sender drawer */}
                {showCalInvite && (
                  <div style={{ marginTop: 12, padding: 14, background: 'var(--cloud)', borderRadius: 10, border: '1px solid var(--mist)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 10 }}>Send Schedule Confirmation to Client</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate)', marginBottom: 4 }}>DATE</div>
                        <input type="date" value={calDate} onChange={e => setCalDate(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate)', marginBottom: 4 }}>TIME SLOT</div>
                        <select value={calTime} onChange={e => setCalTime(e.target.value as 'AM' | 'PM' | 'Flexible')} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                          {['AM', 'PM', 'Flexible'].map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--slate)', marginBottom: 4 }}>TECHNICIAN</div>
                        <select value={calTechId} onChange={e => setCalTechId(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13 }}>
                          <option value="">Select tech…</option>
                          {technicians.filter(t => t.active).map(t => <option key={t.id} value={t.id}>{t.fullName}{t.id === selectedJob.preferredTechnicianId ? ' ★ Preferred' : ''}{!t.isAvailable ? ' (Unavailable)' : ''}</option>)}
                        </select>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => setShowCalInvite(false)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid var(--mist)', background: 'white', cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-body)' }}>Cancel</button>
                      <button onClick={handleSendCalInvite} disabled={!calDate || !calTechId} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', background: calDate && calTechId ? 'var(--polar)' : 'var(--mist)', color: 'white', cursor: calDate && calTechId ? 'pointer' : 'not-allowed', fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)' }}>📅 Send Invite & Confirm Booking</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 2, background: '#FAFCFF' }}>
                {threadMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--slate)', fontSize: 14, padding: '40px 20px' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>👋</div>
                    <div>No messages yet. Send the client a welcome message using Quick Replies below!</div>
                  </div>
                ) : threadMessages.map(msg => renderBubble(msg))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies drawer */}
              {showQuickReplies && (
                <div style={{ borderTop: '1px solid var(--mist)', background: 'white', padding: '12px 16px', maxHeight: 280, overflowY: 'auto', flexShrink: 0 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    {qrCategories.map(cat => (
                      <button key={cat} onClick={() => setQrCategory(cat)} style={{ padding: '4px 10px', borderRadius: 99, fontSize: 11, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${qrCategory === cat ? 'var(--polar)' : 'var(--mist)'}`, background: qrCategory === cat ? 'var(--polar)' : 'white', color: qrCategory === cat ? 'white' : 'var(--slate)', fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>
                        {cat === 'all' ? 'All' : cat}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                    {filteredTemplates.map(tpl => (
                      <button key={tpl.id} onClick={() => { setNewMessage(applyTemplate(tpl.template)); setShowQuickReplies(false); }} style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--mist)', background: 'var(--cloud)', cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--polar)'; (e.currentTarget as HTMLElement).style.background = 'var(--breeze)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--mist)'; (e.currentTarget as HTMLElement).style.background = 'var(--cloud)'; }}>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>{tpl.emoji} {tpl.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--slate)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{tpl.template.replace(/{{[^}]+}}/g, '…')}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Compose bar */}
              <div style={{ padding: '10px 14px', borderTop: showQuickReplies ? 'none' : '1px solid var(--mist)', background: 'white', display: 'flex', gap: 8, flexShrink: 0, alignItems: 'flex-end' }}>
                <button onClick={() => { setShowQuickReplies(!showQuickReplies); setShowTechCheck(false); setShowCalInvite(false); }} title="Quick Reply Templates" style={{ padding: '9px 12px', borderRadius: 8, border: `1.5px solid ${showQuickReplies ? 'var(--polar)' : 'var(--mist)'}`, background: showQuickReplies ? 'var(--breeze)' : 'white', cursor: 'pointer', fontSize: 16, flexShrink: 0, color: showQuickReplies ? 'var(--polar)' : 'var(--ink)' }} aria-label="Quick replies">⚡</button>
                <textarea
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Message the client… or pick a quick reply template ⚡"
                  rows={newMessage.split('\n').length > 2 ? 3 : 1}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', background: 'white', outline: 'none', resize: 'none', minHeight: 40 }}
                  onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
                <Button variant="primary" size="sm" onClick={handleSend} disabled={!newMessage.trim()} style={{ flexShrink: 0, alignSelf: 'flex-end' }}>Send</Button>
              </div>
              {toast.visible && <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'var(--midnight)', color: 'white', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, zIndex: 999, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>{toast.message}</div>}
            </>
          )}
        </div>
      </div>
      <div style={{ marginTop: 20 }}><ChatHistorySection role="admin" /></div>
    </div>
  );
};

// ─── ACCOUNTING PANEL ────────────────────────────────────────────────────────
const AccountingPanel: React.FC = () => {
  const { serviceInvoices, billingStatements, jobs, users, adminReviewBilling, sendBillingToClient, markBillingPaid, sendServiceInvoice } = useStore();
  const [tab, setTab] = useState<'overview' | 'invoices' | 'billing' | 'history'>('overview');
  const [exportStart, setExportStart] = useState('');
  const [exportEnd, setExportEnd] = useState('');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<'GCash' | 'Cash' | 'Bank Transfer' | 'Check'>('Cash');
  const [payRef, setPayRef] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setToast({ message: msg, type, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  // Summary metrics
  const totalInvoiceValue = serviceInvoices.filter(i => i.status === 'Accepted').reduce((s, i) => s + i.totalAmount, 0);
  const pendingBillingApprovals = billingStatements.filter(b => b.status === 'Submitted to Admin');
  const paidBilling = billingStatements.filter(b => b.status === 'Paid');
  const totalCollected = paidBilling.reduce((s, b) => s + b.totalAmount, 0);
  const outstandingBalance = billingStatements.filter(b => b.status === 'Sent to Client' && b.amountDue > 0).reduce((s, b) => s + b.amountDue, 0);
  const cancelledFromInvoice = serviceInvoices.filter(i => i.status === 'Cancelled by Client').length;

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'invoices', label: `🧾 Invoices (${serviceInvoices.length})` },
    { key: 'billing', label: `💼 Billing${pendingBillingApprovals.length > 0 ? ` 🔴 ${pendingBillingApprovals.length}` : ` (${billingStatements.length})`}` },
    { key: 'history', label: `💚 Payment History (${paidBilling.length})` },
  ];

  return (
    <div>
      <Toast {...toast} />
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Accounting</h2>
        <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 4 }}>Monitor invoices, approve billing statements, and track payments.</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key as typeof tab)} style={{
            padding: '10px 16px', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)',
            fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            background: 'transparent', color: tab === t.key ? 'var(--polar)' : 'var(--slate)',
            borderBottom: tab === t.key ? '2px solid var(--polar)' : '2px solid transparent',
            marginBottom: -1, transition: 'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Accepted Invoice Value" value={`₱${(totalInvoiceValue / 1000).toFixed(1)}k`} icon="🧾" accent="var(--polar)" sub="From confirmed quotes" />
            <StatCard label="Pending Billing Approvals" value={pendingBillingApprovals.length} icon="💼" accent={pendingBillingApprovals.length > 0 ? 'var(--ember)' : 'var(--slate)'} sub="Awaiting your review" />
            <StatCard label="Outstanding Balance" value={outstandingBalance > 0 ? `₱${outstandingBalance.toLocaleString()}` : '₱0'} icon="⏳" accent="var(--caution)" sub="From sent billing" />
            <StatCard label="Total Collected" value={`₱${(totalCollected / 1000).toFixed(1)}k`} icon="💚" accent="var(--verified)" sub="Fully paid jobs" />
            <StatCard label="Cancelled via Invoice" value={cancelledFromInvoice} icon="✕" accent="var(--alert)" sub="Client cancelled on price" />
          </div>

          {/* Pending billing approvals alert */}
          {pendingBillingApprovals.length > 0 && (
            <Card style={{ marginBottom: 20, border: '1.5px solid var(--ember)', background: '#FFF7F0' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--midnight)', marginBottom: 12 }}>⚠️ {pendingBillingApprovals.length} Billing Statement{pendingBillingApprovals.length > 1 ? 's' : ''} Awaiting Approval</h3>
              {pendingBillingApprovals.map(b => (
                <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--mist)', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{b.id}</span>
                    <span style={{ color: 'var(--slate)', fontSize: 13, marginLeft: 10 }}>{b.clientName} · {b.operatorName} · ₱{b.totalAmount.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="success" size="sm" onClick={() => { adminReviewBilling(b.id, true, 'Approved.'); showToast(`Billing ${b.id} approved!`); }}>✓ Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => { setRejectId(b.id); setRejectNote(''); }}>↩ Reject</Button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          {/* Recent invoices status */}
          <Card>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--midnight)', marginBottom: 14 }}>Recent Invoice Activity</h3>
            {serviceInvoices.slice(0, 5).map(inv => (
              <div key={inv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--mist)', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{inv.id}</span>
                  <span style={{ color: 'var(--slate)', fontSize: 12, marginLeft: 8 }}>{inv.clientName} · ₱{inv.totalAmount.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Badge label={inv.status} />
                  {inv.status === 'Draft' && <Button variant="ghost" size="sm" onClick={() => { sendServiceInvoice(inv.id); showToast('Invoice sent to client.'); }}>📤 Send</Button>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* INVOICES TAB */}
      {tab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {serviceInvoices.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🧾</div>
              <p style={{ color: 'var(--slate)' }}>No invoices yet. Operators create invoices from their dashboard.</p>
            </Card>
          ) : serviceInvoices.map(inv => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              viewerRole="admin"
              onSend={() => { sendServiceInvoice(inv.id); showToast(`Invoice ${inv.id} sent to client.`); }}
            />
          ))}
        </div>
      )}

      {/* BILLING TAB */}
      {tab === 'billing' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {billingStatements.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💼</div>
              <p style={{ color: 'var(--slate)' }}>No billing statements yet.</p>
            </Card>
          ) : billingStatements.map(bill => (
            <BillingCard
              key={bill.id}
              billing={bill}
              viewerRole="admin"
              onApprove={() => { adminReviewBilling(bill.id, true, 'Approved by ACT Admin.'); showToast(`Billing ${bill.id} approved!`); }}
              onReject={() => { setRejectId(bill.id); setRejectNote(''); }}
              onSendToClient={() => { sendBillingToClient(bill.id); showToast(`Billing ${bill.id} sent to client.`); }}
              onMarkPaid={() => { setPayingId(bill.id); }}
            />
          ))}
        </div>
      )}

      {/* PAYMENT HISTORY TAB */}
      {tab === 'history' && (
        <div>
          {/* CSV Export Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16, padding: '12px 16px', background: 'white', borderRadius: 12, border: '1px solid var(--mist)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginRight: 4 }}>Export:</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600 }}>From</label>
              <input type="date" value={exportStart} onChange={e => setExportStart(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <label style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600 }}>To</label>
              <input type="date" value={exportEnd} onChange={e => setExportEnd(e.target.value)} style={{ padding: '6px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13 }} />
            </div>
            <Button variant="secondary" size="sm" onClick={() => exportBillingCSV(billingStatements, exportStart || undefined, exportEnd || undefined)}>📥 Export Payments CSV</Button>
            <Button variant="ghost" size="sm" onClick={() => exportBillingCSV(billingStatements, exportStart || undefined, exportEnd || undefined, true)}>📥 All Billing (incl. Unpaid)</Button>
            <Button variant="ghost" size="sm" onClick={() => exportMonthlySummaryCSV(billingStatements, jobs)}>📊 Monthly Summary CSV</Button>
          </div>
          {paidBilling.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💚</div>
              <p style={{ color: 'var(--slate)' }}>No completed payments yet.</p>
            </Card>
          ) : (
            <Card>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--midnight)', marginBottom: 16 }}>Paid Billing Statements</h3>
              <div className="admin-table-wrap" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--mist)' }}>
                      {['Billing ID', 'Client', 'Operator', 'Total', 'Paid', 'Method', 'Date'].map(h => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paidBilling.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid var(--mist)' }}>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--polar)' }}>{b.id}</td>
                        <td style={{ padding: '10px 12px', fontSize: 14, fontWeight: 600 }}>{b.clientName}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--slate)' }}>{b.operatorName}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>₱{b.totalAmount.toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--verified)', fontWeight: 700 }}>₱{(b.amountPaidAtClose !== undefined ? b.amountPaidAtClose : b.amountDue).toLocaleString()}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13 }}>{b.paymentMethod}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13, color: 'var(--slate)' }}>{b.paidAt ? new Date(b.paidAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Reject Modal */}
      <Modal open={!!rejectId} onClose={() => setRejectId(null)} title="Return for Revision" maxWidth={420}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--slate)' }}>Tell the operator what needs to be corrected.</p>
          <textarea
            value={rejectNote}
            onChange={e => setRejectNote(e.target.value)}
            placeholder="e.g. Line item prices don't match agreed rates. Please revise."
            rows={3}
            style={{ width: '100%', padding: '12px 14px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 14, resize: 'none', outline: 'none' }}
            onFocus={e => { e.target.style.borderColor = 'var(--alert)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" fullWidth onClick={() => setRejectId(null)}>Cancel</Button>
            <Button variant="danger" fullWidth onClick={() => {
              if (rejectId) { adminReviewBilling(rejectId, false, rejectNote); showToast('Billing returned for revision.'); }
              setRejectId(null);
            }} disabled={!rejectNote.trim()}>Return for Revision</Button>
          </div>
        </div>
      </Modal>

      {/* Mark Paid Modal */}
      <Modal open={!!payingId} onClose={() => setPayingId(null)} title="Mark as Paid" maxWidth={360}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 14, color: 'var(--slate)' }}>Confirm the payment method used by the client.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {(['GCash', 'Cash', 'Bank Transfer', 'Check'] as const).map(m => (
              <button key={m} onClick={() => setPayMethod(m)} style={{ padding: '12px 8px', borderRadius: 10, border: `2px solid ${payMethod === m ? 'var(--verified)' : 'var(--mist)'}`, background: payMethod === m ? 'var(--verified-bg)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 700, color: payMethod === m ? 'var(--verified)' : 'var(--ink)' }}>
                {m === 'GCash' ? '📱' : m === 'Cash' ? '💵' : m === 'Check' ? '📝' : '🏦'}<br />{m}
              </button>
            ))}
          </div>
          <Input label="Payment Reference (proof of payment)" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="GCash ref no., bank txn ID, check no.…" />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="ghost" fullWidth onClick={() => { setPayingId(null); setPayRef(''); }}>Cancel</Button>
            <Button variant="success" fullWidth onClick={() => {
              if (payingId) { markBillingPaid(payingId, payMethod, payRef.trim() || undefined); showToast('Payment recorded successfully!'); }
              setPayingId(null); setPayRef('');
            }}>💚 Record Payment</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── MAIN ADMIN DASHBOARD ─────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { currentUser, jobs, technicians, hydrate } = useStore();
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;
  const [activePanel, setActivePanel] = useState('dashboard');

  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else if (currentUser.role === 'operator') {
      router.push('/operator-dashboard');
    } else if (currentUser.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Hydrate from the server (system of record) + run 7-day chat retention job
  useEffect(() => { hydrate(); }, [hydrate]);

  if (!currentUser || currentUser.role !== 'admin') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--midnight)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--frost)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', fontSize: 14 }}>Redirecting…</p>
      </div>
    </div>
  );

  const renderPanel = () => {
    switch (activePanel) {
      case 'dashboard': return <OverviewPanel jobs={jobs} technicians={technicians} onNav={setActivePanel} />;
      case 'jobs': return <JobsPanel jobs={jobs} technicians={technicians} onNav={setActivePanel} />;
      case 'technicians': return <TechniciansPanel technicians={technicians} />;
      case 'operators': return <OperatorsPanel />;
      case 'schedule': return <SchedulePanel jobs={jobs} technicians={technicians} />;
      case 'clients': return <ClientsPanel />;
      case 'followups': return <FollowUpsPanel />;
      case 'messages': return <MessagesMonitorPanel jobs={jobs} />;
      case 'finance': return <FinancePanel jobs={jobs} />;
      case 'accounting': return <AccountingPanel />;
      case 'reviews': return <ReviewsPanel jobs={jobs} />;
      case 'catalog': return <CatalogPanel />;
      case 'settings': return (
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 20 }}>Settings</h2>
          <Card><p style={{ color: 'var(--slate)' }}>Coverage areas, payment methods, notification templates, and business hours — available in full production build.</p></Card>
        </div>
      );
      default: return <OverviewPanel jobs={jobs} technicians={technicians} onNav={setActivePanel} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cloud)', fontFamily: 'var(--font-body)' }}>
      <div style={{
        position: isNarrow ? 'sticky' : 'fixed',
        top: 0,
        left: 0,
        width: isNarrow ? '100%' : 240,
        height: isNarrow ? 'auto' : '100vh',
        zIndex: 49,
        overflowY: isNarrow ? 'hidden' : 'auto',
        overflowX: isNarrow ? 'auto' : 'hidden',
      }}>
        <AdminSidebar active={activePanel} onNav={setActivePanel} />
      </div>

      <main style={{
        marginLeft: isNarrow ? 0 : 240,
        minHeight: '100vh',
        background: 'var(--cloud)',
      }}>
        <div style={{ padding: isNarrow ? '20px 16px' : '28px 32px' }}>
          {renderPanel()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
