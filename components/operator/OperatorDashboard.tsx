'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import type { Job, Message, TimeSlot, ServiceInvoice, BillingStatement, InvoiceLineItem } from '@/store';
import { Button, Badge, Card, Modal, Input, Toast } from '@/components/ui';
import InvoiceCard from '@/components/billing/InvoiceCard';
import BillingCard from '@/components/billing/BillingCard';
import ChatHistorySection from '@/components/chat/ChatHistory';
import { useBreakpoint } from '@/hooks/useBreakpoint';

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
const Sidebar: React.FC<{ active: string; onNav: (v: string) => void; unreadCount: number }> = ({ active, onNav, unreadCount }) => {
  const { logout, currentUser } = useStore();
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;
  const router = useRouter();

  const navItems = [
    { key: 'today', icon: '📅', label: 'Today' },
    { key: 'jobs', icon: '📋', label: 'My Jobs' },
    { key: 'messages', icon: '💬', label: 'Messages', badge: unreadCount },
    { key: 'invoices', icon: '🧾', label: 'Invoices' },
    { key: 'billing', icon: '💼', label: 'Billing' },
    { key: 'schedule', icon: '🗓️', label: 'Schedule' },
    { key: 'profile', icon: '👤', label: 'Profile' },
  ];

  return (
    <aside style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(180deg, var(--midnight) 0%, #0a3d52 100%)',
      display: 'flex', flexDirection: isNarrow ? 'row' : 'column',
      overflowX: isNarrow ? 'auto' : 'hidden',
      overflowY: isNarrow ? 'hidden' : 'auto',
      flexShrink: 0,
    }}>
      {/* Header */}
      {!isNarrow && (
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--polar), var(--frost))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }}>
              {currentUser?.firstName[0]}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, color: 'white' }}>
                {currentUser?.firstName} {currentUser?.lastName}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>ACT Operator</div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: isNarrow ? '8px 12px' : '16px 12px', display: 'flex', flexDirection: isNarrow ? 'row' : 'column', gap: 2, overflowX: isNarrow ? 'auto' : 'hidden' }}>
        {navItems.map(({ key, icon, label, badge }) => (
          <button key={key} onClick={() => onNav(key)} style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
            borderRadius: 10, border: 'none', cursor: 'pointer', width: '100%',
            background: active === key ? 'rgba(91,196,214,0.15)' : 'transparent',
            color: active === key ? 'var(--frost)' : 'rgba(255,255,255,0.6)',
            fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active === key ? 700 : 400,
            textAlign: 'left', transition: 'all 0.2s', position: 'relative', flexShrink: 0,
          }}
            onMouseEnter={e => { if (active !== key) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { if (active !== key) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
            {!isNarrow && label}
            {badge != null && badge > 0 && (
              <span style={{
                marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 99,
                background: 'var(--ember)', color: 'white', fontSize: 11, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px',
              }}>
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer */}
      {!isNarrow && (
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={() => { logout(); router.push('/'); }} style={{
            display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '10px 12px',
            borderRadius: 10, border: 'none', cursor: 'pointer', background: 'transparent',
            color: 'rgba(255,255,255,0.35)', fontFamily: 'var(--font-body)', fontSize: 13,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'transparent'; }}
          >
            🚪 <span>Sign Out</span>
          </button>
        </div>
      )}
    </aside>
  );
};

// ─── TODAY PANEL ──────────────────────────────────────────────────────────────
const TodayPanel: React.FC<{ jobs: Job[]; onNav: (v: string) => void }> = ({ jobs, onNav }) => {
  const { currentUser, updateJob, sendMessage, addNotification } = useStore();
  const [fieldNotesJobId, setFieldNotesJobId] = useState<string | null>(null);
  const [fieldNotesText, setFieldNotesText] = useState('');
  const today = new Date().toISOString().split('T')[0];
  const todayJobs = jobs.filter(j => j.preferredDate === today);
  const upcomingJobs = jobs.filter(j => j.preferredDate > today && j.status !== 'Cancelled').slice(0, 5);
  const pendingCount = jobs.filter(j => ['Pending', 'Awaiting Payment', 'Confirmed'].includes(j.status)).length;
  const activeCount = jobs.filter(j => j.status === 'Active').length;

  return (
    <div>
      {/* Greeting */}
      <div style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)',
        borderRadius: 20, padding: '28px 32px', marginBottom: 28, color: 'white', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -20, top: -20, width: 140, height: 140, borderRadius: '50%', background: 'rgba(91,196,214,0.08)' }} />
        <div style={{ position: 'absolute', right: 20, bottom: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(10,110,143,0.1)' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>
            {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 800, marginBottom: 8 }}>
            Good day, {currentUser?.firstName}! 👋
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6 }}>
            {todayJobs.length > 0
              ? `You have ${todayJobs.length} job${todayJobs.length > 1 ? 's' : ''} scheduled today.`
              : 'No jobs scheduled for today. Check upcoming assignments below.'}
          </p>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14, marginBottom: 28 }}>
        {[
          { label: "Today's Jobs", value: todayJobs.length, icon: '📅', accent: 'var(--polar)' },
          { label: 'Active Now', value: activeCount, icon: '🔧', accent: 'var(--verified)' },
          { label: 'Pending', value: pendingCount, icon: '⏳', accent: 'var(--caution)' },
          { label: 'Total Assigned', value: jobs.length, icon: '📋', accent: 'var(--midnight)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4, fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Today's jobs */}
      {todayJobs.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--midnight)', marginBottom: 16 }}>📅 Today&apos;s Jobs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {todayJobs.map(job => (
              <div key={job.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--cloud)', borderRadius: 14, gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'center', flex: 1, minWidth: 0 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: job.status === 'Active' ? 'linear-gradient(135deg, var(--verified), #159069)' : 'linear-gradient(135deg, var(--polar), var(--polar-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 22, flexShrink: 0 }}>
                    {job.status === 'Active' ? '🔧' : '📅'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 2 }}>{job.clientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{job.serviceType} · {job.numberOfUnits} unit{job.numberOfUnits > 1 ? 's' : ''}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>📍 {job.serviceAddress}, {job.city} · {job.timeSlot === 'AM' ? '8AM–12PM' : job.timeSlot === 'PM' ? '1PM–5PM' : 'Flexible'}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
                  <Badge label={job.status} />
                  <Button variant="secondary" size="sm" onClick={() => onNav('messages')}>Message</Button>
                  {(job.status === 'Confirmed' || job.status === 'Scheduled') && (
                    <Button variant="secondary" size="sm" onClick={() => { updateJob(job.id, { status: 'Active' }); addNotification({ userId: 'ADMIN001', jobId: job.id, message: `Operator marked job ${job.id} (${job.clientName}) as Active.`, type: 'info', read: false }); }}>🚀 Mark Active</Button>
                  )}
                  {job.status === 'Active' && fieldNotesJobId !== job.id && (
                    <Button variant="secondary" size="sm" onClick={() => { setFieldNotesJobId(job.id); setFieldNotesText(job.techFieldNotes || ''); }}>✅ Mark Complete</Button>
                  )}
                  {job.status === 'Active' && fieldNotesJobId === job.id && (
                    <div style={{ width: '100%', marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <textarea
                        value={fieldNotesText}
                        onChange={e => setFieldNotesText(e.target.value)}
                        placeholder="Field notes (work done, issues found)..."
                        rows={2}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="secondary" size="sm" onClick={() => {
                          const nextDue = new Date(); nextDue.setDate(nextDue.getDate() + 90);
                          updateJob(job.id, { status: 'Completed', techFieldNotes: fieldNotesText || undefined, nextDueDate: nextDue.toISOString().split('T')[0] });
                          addNotification({ userId: 'ADMIN001', jobId: job.id, message: `Job ${job.id} (${job.clientName}) marked Completed by operator.`, type: 'success', read: false });
                          addNotification({ userId: job.clientId, jobId: job.id, message: `Your service for job ${job.id} is complete! Please leave a review.`, type: 'success', read: false });
                          setFieldNotesJobId(null); setFieldNotesText('');
                        }}>Confirm Complete</Button>
                        <Button variant="ghost" size="sm" onClick={() => { setFieldNotesJobId(null); setFieldNotesText(''); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Upcoming */}
      {upcomingJobs.length > 0 && (
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 800, color: 'var(--midnight)' }}>🗓️ Upcoming Jobs</h3>
            <Button variant="ghost" size="sm" onClick={() => onNav('jobs')}>View All →</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcomingJobs.map(job => (
              <div key={job.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{job.clientName} — {job.serviceType.split(' ')[0]}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>{job.preferredDate} · {job.city}</div>
                </div>
                <Badge label={job.status} size="xs" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

// ─── MY JOBS PANEL ────────────────────────────────────────────────────────────
const MyJobsPanel: React.FC<{ jobs: Job[]; onOpenMessages: (jobId: string) => void }> = ({ jobs, onOpenMessages }) => {
  const { currentUser, updateJob, users, sendMessage, addNotification } = useStore();
  const [filter, setFilter] = useState('All');
  const statuses = ['All', 'Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled'];
  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);

  // Detail modal state
  const [detailJob, setDetailJob] = useState<Job | null>(null);
  const [detailNotes, setDetailNotes] = useState('');
  const [showScopeForm, setShowScopeForm] = useState(false);
  const [scopeNotes, setScopeNotes] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setToast({ message: msg, type, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  // Complete flow state
  const [completeJobId, setCompleteJobId] = useState<string | null>(null);
  const [completeNotes, setCompleteNotes] = useState('');

  const openDetail = (job: Job) => { setDetailJob(job); setDetailNotes(job.techFieldNotes || ''); setShowScopeForm(false); setScopeNotes(''); };

  const handleSendScopeReport = (job: Job) => {
    if (!scopeNotes.trim() || !currentUser) return;
    updateJob(job.id, { techFieldNotes: scopeNotes });
    sendMessage({
      jobId: job.id,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: 'operator',
      content: `⚠️ Scope change report: ${scopeNotes}. Please advise on how to proceed.`,
      type: 'text',
      readBy: [currentUser.id],
    });
    addNotification({ userId: 'ADMIN001', jobId: job.id, message: `⚠️ Scope change report from operator on job ${job.id} (${job.clientName}): ${scopeNotes}`, type: 'warning', read: false });
    setShowScopeForm(false); setScopeNotes('');
    showToast('Scope change report sent to admin.');
    if (detailJob?.id === job.id) setDetailJob({ ...job, techFieldNotes: scopeNotes });
  };

  const handleSaveDetailNotes = (job: Job) => {
    updateJob(job.id, { techFieldNotes: detailNotes });
    showToast('Field notes saved.');
  };

  return (
    <div>
      <Toast {...toast} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>
          My Jobs <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--slate)' }}>({filtered.length})</span>
        </h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              padding: '6px 12px', borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: `1.5px solid ${filter === s ? 'var(--polar)' : 'var(--mist)'}`,
              background: filter === s ? 'var(--polar)' : 'white', color: filter === s ? 'white' : 'var(--slate)', fontFamily: 'var(--font-body)',
            }}>{s}</button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--mist)' }}>
          <thead style={{ background: 'var(--cloud)' }}>
            <tr>
              {['Job', 'Client', 'Service', 'Date', 'City', 'Status', 'Technician', 'Actions'].map(h => (
                <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--slate)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: 'var(--slate)', fontSize: 14 }}>No jobs found.</td></tr>
            ) : filtered.map(job => {
              const client = users.find(u => u.id === job.clientId);
              return (
                <React.Fragment key={job.id}>
                  <tr style={{ borderTop: '1px solid var(--mist)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cloud)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'white'}>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--polar)' }}>{job.id}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600 }}>
                      {job.clientName}
                      {client?.phone && <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>📱 {client.phone}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--slate)', whiteSpace: 'nowrap' }}>{job.serviceType}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>{job.preferredDate}<br /><span style={{ fontSize: 11, color: 'var(--slate)' }}>{job.timeSlot}</span></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--slate)' }}>{job.city}</td>
                    <td style={{ padding: '12px 16px' }}><Badge label={job.status} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: job.technicianName ? 'var(--verified)' : 'var(--slate)' }}>{job.technicianName || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <Button variant="secondary" size="sm" onClick={() => onOpenMessages(job.id)}>💬 Message</Button>
                        <Button variant="ghost" size="sm" onClick={() => openDetail(job)}>🔍 Details</Button>
                        {(job.status === 'Confirmed' || job.status === 'Scheduled') && (
                          <Button variant="secondary" size="sm" onClick={() => { updateJob(job.id, { status: 'Active' }); addNotification({ userId: 'ADMIN001', jobId: job.id, message: `Operator marked job ${job.id} (${job.clientName}) as Active.`, type: 'info', read: false }); showToast('Job marked Active.'); }}>🚀 Mark Active</Button>
                        )}
                        {job.status === 'Active' && completeJobId !== job.id && (
                          <Button variant="secondary" size="sm" onClick={() => { setCompleteJobId(job.id); setCompleteNotes(job.techFieldNotes || ''); }}>✅ Mark Complete</Button>
                        )}
                        {job.status === 'Active' && completeJobId === job.id && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 4 }}>
                            <textarea
                              value={completeNotes}
                              onChange={e => setCompleteNotes(e.target.value)}
                              placeholder="Field notes (work done, issues found)..."
                              rows={2}
                              style={{ padding: '8px 10px', borderRadius: 8, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 12, resize: 'vertical', outline: 'none', minWidth: 200 }}
                              onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                              onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                            />
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Button variant="secondary" size="sm" onClick={() => {
                                const nextDue = new Date(); nextDue.setDate(nextDue.getDate() + 90);
                                updateJob(job.id, { status: 'Completed', techFieldNotes: completeNotes || undefined, nextDueDate: nextDue.toISOString().split('T')[0] });
                                addNotification({ userId: 'ADMIN001', jobId: job.id, message: `Job ${job.id} (${job.clientName}) marked Completed by operator.`, type: 'success', read: false });
                                addNotification({ userId: job.clientId, jobId: job.id, message: `Your service for job ${job.id} is complete! Please leave a review.`, type: 'success', read: false });
                                setCompleteJobId(null); setCompleteNotes('');
                                showToast('Job marked Completed!');
                              }}>Confirm</Button>
                              <Button variant="ghost" size="sm" onClick={() => { setCompleteJobId(null); setCompleteNotes(''); }}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Job Detail Modal */}
      <Modal open={!!detailJob} onClose={() => { setDetailJob(null); setShowScopeForm(false); }} title={`Job Details — ${detailJob?.id}`} maxWidth={520}>
        {detailJob && (() => {
          const client = users.find(u => u.id === detailJob.clientId);
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Client & Job Info */}
              <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 10 }}>Client & Job Info</div>
                {[
                  { label: 'Client', value: detailJob.clientName },
                  { label: 'Phone', value: client?.phone || '—' },
                  { label: 'Address', value: `${detailJob.serviceAddress}, ${detailJob.city}` },
                  { label: 'Service', value: `${detailJob.serviceType} — ${detailJob.numberOfUnits} ${detailJob.acType} unit${detailJob.numberOfUnits > 1 ? 's' : ''}` },
                  { label: 'Date', value: `${detailJob.preferredDate} (${detailJob.timeSlot === 'AM' ? '8AM–12PM' : detailJob.timeSlot === 'PM' ? '1PM–5PM' : 'Flexible'})` },
                  { label: 'Payment', value: detailJob.preferredPaymentMethod || '—' },
                  { label: 'Technician', value: detailJob.technicianName || '—' },
                  ...(detailJob.specialInstructions ? [{ label: 'Special Instructions', value: detailJob.specialInstructions }] : []),
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 700, minWidth: 110 }}>{r.label}:</span>
                    <span style={{ fontSize: 13, color: 'var(--ink)', flex: 1 }}>{r.value}</span>
                  </div>
                ))}
              </div>

              {/* Field Notes */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Field Notes</label>
                <textarea
                  value={detailNotes}
                  onChange={e => setDetailNotes(e.target.value)}
                  placeholder="Record what was found, what was done, any issues..."
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                />
                <Button variant="secondary" size="sm" style={{ marginTop: 8 }} onClick={() => handleSaveDetailNotes(detailJob)}>Save Notes</Button>
              </div>

              {/* Scope Change Report */}
              {detailJob.status === 'Active' && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                  {!showScopeForm ? (
                    <Button variant="ghost" size="sm" onClick={() => setShowScopeForm(true)}>📋 Report Scope Change</Button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)' }}>📋 Report Scope Change</div>
                      <textarea
                        value={scopeNotes}
                        onChange={e => setScopeNotes(e.target.value)}
                        placeholder="What did you find? Describe the scope change..."
                        rows={3}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                        onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                        onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
                      />
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="secondary" size="sm" onClick={() => handleSendScopeReport(detailJob)} disabled={!scopeNotes.trim()}>Send Report to Admin</Button>
                        <Button variant="ghost" size="sm" onClick={() => { setShowScopeForm(false); setScopeNotes(''); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="ghost" onClick={() => { setDetailJob(null); setShowScopeForm(false); }}>Close</Button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

// ─── MESSAGE BUBBLE ───────────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: Message; currentUserId: string; onRespondInvite?: (msgId: string, accepted: boolean) => void }> = ({ msg, currentUserId, onRespondInvite }) => {
  const isMine = msg.senderId === currentUserId;
  const isSystem = msg.senderRole === 'system' || msg.type === 'status_update';

  if (isSystem) {
    return (
      <div style={{ textAlign: 'center', margin: '8px 0' }}>
        <span style={{ background: 'var(--breeze)', color: 'var(--slate)', fontSize: 12, padding: '4px 12px', borderRadius: 99, fontStyle: 'italic' }}>
          {msg.content}
        </span>
      </div>
    );
  }

  if (msg.type === 'calendar_invite' && msg.calendarData) {
    const cd = msg.calendarData;
    const isPending = cd.accepted === undefined;
    return (
      <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
        <div style={{ maxWidth: '85%', minWidth: 280 }}>
          {!isMine && <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 4, paddingLeft: 4 }}>{msg.senderName}</div>}
          <div style={{
            background: 'white', border: '2px solid var(--polar)', borderRadius: 16, overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(10,110,143,0.12)',
          }}>
            {/* Invite header */}
            <div style={{ background: 'linear-gradient(135deg, var(--midnight), var(--polar))', padding: '14px 16px', color: 'white' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '1px', opacity: 0.7, textTransform: 'uppercase', marginBottom: 4 }}>📅 Service Appointment</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800 }}>{cd.serviceType}</div>
            </div>
            {/* Invite body */}
            <div style={{ padding: '14px 16px' }}>
              {[
                { icon: '📅', label: 'Date', value: new Date(cd.confirmedDate).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
                { icon: '⏰', label: 'Time', value: cd.timeSlot === 'AM' ? 'Morning — 8:00 AM to 12:00 PM' : cd.timeSlot === 'PM' ? 'Afternoon — 1:00 PM to 5:00 PM' : 'Flexible (AM or PM)' },
                { icon: '🧑‍🔧', label: 'Technician', value: cd.technicianName },
                { icon: '📍', label: 'Address', value: cd.address },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ flexShrink: 0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--slate)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{r.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, marginTop: 1 }}>{r.value}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Response area */}
            <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px' }}>
              {isPending && onRespondInvite ? (
                <div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 10, textAlign: 'center' }}>Confirm your appointment</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="secondary" size="sm" fullWidth onClick={() => onRespondInvite(msg.id, true)}>✓ Accept</Button>
                    <Button variant="ghost" size="sm" fullWidth onClick={() => onRespondInvite(msg.id, false)}>✕ Request Reschedule</Button>
                  </div>
                </div>
              ) : cd.accepted === true ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--verified)', fontWeight: 700, fontSize: 13 }}>
                  <span style={{ fontSize: 18 }}>✅</span> Appointment Confirmed
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', color: 'var(--caution)', fontWeight: 700, fontSize: 13 }}>
                  <span style={{ fontSize: 18 }}>🔄</span> Reschedule Requested
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 4, textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : 4 }}>
            {new Date(msg.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  }

  // Regular text message
  return (
    <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      <div style={{ maxWidth: '75%' }}>
        {!isMine && <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 3, paddingLeft: 4 }}>{msg.senderName}</div>}
        <div style={{
          background: isMine ? 'linear-gradient(135deg, var(--polar), var(--polar-dark))' : 'white',
          color: isMine ? 'white' : 'var(--ink)',
          border: isMine ? 'none' : '1px solid var(--border)',
          borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          padding: '10px 14px', fontSize: 14, lineHeight: 1.5,
          boxShadow: isMine ? '0 2px 8px rgba(10,110,143,0.25)' : 'var(--shadow-xs)',
        }}>
          {msg.content}
        </div>
        <div style={{ fontSize: 10, color: 'var(--slate)', marginTop: 3, textAlign: isMine ? 'right' : 'left', paddingLeft: isMine ? 0 : 4 }}>
          {new Date(msg.createdAt).toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

// ─── MESSAGES PANEL ───────────────────────────────────────────────────────────
const MessagesPanel: React.FC<{ jobs: Job[]; initialJobId?: string | null }> = ({ jobs, initialJobId }) => {
  const { currentUser, messages, sendMessage, markMessagesRead, respondToCalendarInvite, jobs: allJobs } = useStore();
  const { isMobile } = useBreakpoint();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(initialJobId || (jobs[0]?.id ?? null));
  const [newMessage, setNewMessage] = useState('');
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteDate, setInviteDate] = useState('');
  const [inviteSlot, setInviteSlot] = useState<TimeSlot>('AM');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedJob = allJobs.find(j => j.id === selectedJobId);
  const threadMessages = messages.filter(m => m.jobId === selectedJobId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  useEffect(() => {
    if (selectedJobId && currentUser) markMessagesRead(selectedJobId, currentUser.id);
  }, [selectedJobId, currentUser, markMessagesRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages.length]);

  const getUnreadCount = (jobId: string) => {
    if (!currentUser) return 0;
    return messages.filter(m => m.jobId === jobId && !m.readBy.includes(currentUser.id)).length;
  };

  const handleSend = () => {
    if (!newMessage.trim() || !selectedJobId || !currentUser) return;
    sendMessage({
      jobId: selectedJobId,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: 'operator',
      content: newMessage.trim(),
      type: 'text',
      readBy: [currentUser.id],
    });
    setNewMessage('');
  };

  const handleSendInvite = () => {
    if (!inviteDate || !selectedJobId || !currentUser || !selectedJob) return;
    sendMessage({
      jobId: selectedJobId,
      senderId: currentUser.id,
      senderName: `${currentUser.firstName} ${currentUser.lastName}`,
      senderRole: 'operator',
      content: 'I\'ve sent you a calendar invite for your service appointment.',
      type: 'calendar_invite',
      calendarData: {
        confirmedDate: inviteDate,
        timeSlot: inviteSlot,
        technicianName: selectedJob.technicianName || 'ACT Technician',
        address: `${selectedJob.serviceAddress}, ${selectedJob.city}`,
        serviceType: `${selectedJob.serviceType} — ${selectedJob.numberOfUnits} ${selectedJob.acType} unit${selectedJob.numberOfUnits > 1 ? 's' : ''}`,
        accepted: undefined,
      },
      readBy: [currentUser.id],
    });
    setShowInviteForm(false);
    setInviteDate('');
    setInviteSlot('AM');
  };

  return (
    <>
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : 'calc(100vh - 160px)', minHeight: 500, gap: 20 }}>
      {/* Thread list */}
      <div style={{ width: isMobile ? '100%' : 280, maxHeight: isMobile ? 220 : undefined, flexShrink: 0, background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color: 'var(--midnight)' }}>Conversations</h3>
          <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{jobs.length} active thread{jobs.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {jobs.length === 0 ? (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--slate)', fontSize: 13 }}>No assigned jobs yet.</div>
          ) : jobs.map(job => {
            const unread = getUnreadCount(job.id);
            const lastMsg = messages.filter(m => m.jobId === job.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
            const isSelected = job.id === selectedJobId;
            return (
              <button key={job.id} onClick={() => setSelectedJobId(job.id)} style={{
                width: '100%', padding: '14px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                background: isSelected ? 'var(--breeze)' : 'transparent',
                borderLeft: isSelected ? '3px solid var(--polar)' : '3px solid transparent',
                borderBottom: '1px solid var(--border)', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'var(--snow)'; }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{job.clientName}</div>
                  {unread > 0 && (
                    <span style={{ background: 'var(--ember)', color: 'white', borderRadius: 99, fontSize: 10, fontWeight: 800, padding: '2px 6px', flexShrink: 0 }}>{unread}</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginBottom: 4 }}>{job.id} · {job.city}</div>
                {lastMsg && (
                  <div style={{ fontSize: 12, color: 'var(--slate)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {lastMsg.type === 'calendar_invite' ? '📅 Calendar Invite' : lastMsg.content}
                  </div>
                )}
                <div style={{ marginTop: 4 }}><Badge label={job.status} size="xs" /></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, background: 'white', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedJob ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate)', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>Select a conversation</div>
            <div style={{ fontSize: 13 }}>Choose a job thread from the left to start messaging.</div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--polar), var(--frost))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
                    {selectedJob.clientName[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--ink)' }}>{selectedJob.clientName}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{selectedJob.id} · {selectedJob.serviceType} · {selectedJob.city}</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                <Badge label={selectedJob.status} />
                <Button variant="secondary" size="sm" onClick={() => setShowInviteForm(true)}>📅 Send Calendar Invite</Button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 8px' }}>
              {threadMessages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--slate)', marginTop: 60 }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>👋</div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Start the conversation</div>
                  <div style={{ fontSize: 13 }}>Introduce yourself to {selectedJob.clientName} and confirm their appointment details.</div>
                </div>
              ) : threadMessages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  currentUserId={currentUser?.id || ''}
                  onRespondInvite={undefined} // operators don't respond to their own invites
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder={`Message ${selectedJob.clientName}… (Enter to send)`}
                rows={2}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 12, border: '1.5px solid var(--border)',
                  fontFamily: 'var(--font-body)', fontSize: 14, resize: 'none', outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
              <Button variant="secondary" size="sm" onClick={handleSend} disabled={!newMessage.trim()} style={{ flexShrink: 0 }}>Send</Button>
            </div>
          </>
        )}
      </div>

      {/* Calendar Invite Modal */}
      <Modal open={showInviteForm} onClose={() => setShowInviteForm(false)} title="Send Calendar Invite" maxWidth={440}>
        {selectedJob && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 8 }}>Job Details</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.8 }}>
                <strong>{selectedJob.clientName}</strong> · {selectedJob.serviceType}<br />
                {selectedJob.numberOfUnits} {selectedJob.acType} unit{selectedJob.numberOfUnits > 1 ? 's' : ''}<br />
                📍 {selectedJob.serviceAddress}, {selectedJob.city}
              </div>
            </div>
            <Input
              label="Confirmed Service Date *"
              type="date"
              value={inviteDate}
              onChange={e => setInviteDate(e.target.value)}
              hint="This will be sent as the confirmed appointment date."
            />
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time Slot</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {([
                  { slot: 'AM' as TimeSlot, label: 'Morning', sub: '8AM–12PM' },
                  { slot: 'PM' as TimeSlot, label: 'Afternoon', sub: '1PM–5PM' },
                  { slot: 'Flexible' as TimeSlot, label: 'Flexible', sub: 'Either' },
                ]).map(ts => (
                  <button key={ts.slot} onClick={() => setInviteSlot(ts.slot)} style={{
                    padding: '12px 8px', borderRadius: 10,
                    border: `2px solid ${inviteSlot === ts.slot ? 'var(--polar)' : 'var(--mist)'}`,
                    background: inviteSlot === ts.slot ? 'var(--breeze)' : 'white', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                    color: inviteSlot === ts.slot ? 'var(--polar)' : 'var(--ink)',
                  }}>
                    {ts.label}<br />
                    <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--slate)' }}>{ts.sub}</span>
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={handleSendInvite} disabled={!inviteDate}>📅 Send Invite to Client</Button>
              <Button variant="ghost" onClick={() => setShowInviteForm(false)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
    <ChatHistorySection role="operator" />
    </>
  );
};

// ─── SCHEDULE PANEL ────────────────────────────────────────────────────────────
const SchedulePanel: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 8 }}>My Schedule</h2>
      <p style={{ color: 'var(--slate)', fontSize: 14, marginBottom: 24 }}>Your 7-day job calendar.</p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `180px repeat(7, minmax(120px, 1fr))`, gap: 1, background: 'var(--border)', borderRadius: 16, overflow: 'hidden', minWidth: 800 }}>
          {/* Header */}
          <div style={{ background: 'var(--midnight)', padding: '14px 16px', color: 'white', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Time</div>
          {days.map((d, i) => {
            const isToday = d.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
            return (
              <div key={i} style={{ background: isToday ? 'var(--polar)' : 'var(--midnight)', padding: '14px 16px', textAlign: 'center', color: 'white' }}>
                <div style={{ fontSize: 13, fontWeight: 800 }}>{d.toLocaleDateString('en-PH', { weekday: 'short' })}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}</div>
                {isToday && <div style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.2)', borderRadius: 99, padding: '1px 6px', marginTop: 3, display: 'inline-block' }}>TODAY</div>}
              </div>
            );
          })}

          {/* Time slots */}
          {(['AM', 'PM'] as TimeSlot[]).map(slot => (
            <React.Fragment key={slot}>
              <div style={{ background: 'white', padding: '14px 16px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)' }}>{slot === 'AM' ? '🌅 Morning' : '☀️ Afternoon'}</div>
                <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 2 }}>{slot === 'AM' ? '8AM – 12PM' : '1PM – 5PM'}</div>
              </div>
              {days.map(d => {
                const dateStr = d.toISOString().split('T')[0];
                const dayJobs = jobs.filter(j =>
                  j.preferredDate === dateStr &&
                  (j.timeSlot === slot || (j.timeSlot === 'Flexible' && slot === 'AM')) &&
                  j.status !== 'Cancelled'
                );
                return (
                  <div key={dateStr + slot} style={{ background: 'white', padding: '8px', borderTop: '1px solid var(--border)', minHeight: 80 }}>
                    {dayJobs.map(job => (
                      <div key={job.id} style={{
                        background: job.status === 'Completed' ? '#D1FAE5' : job.status === 'Active' ? '#DBEAFE' : 'var(--breeze)',
                        border: `1px solid ${job.status === 'Completed' ? '#86EFAC' : 'var(--mist)'}`,
                        borderRadius: 8, padding: '6px 8px', fontSize: 11, fontWeight: 600,
                        color: job.status === 'Completed' ? '#065F46' : 'var(--polar)', marginBottom: 4,
                      }}>
                        <div>{job.clientName} — {job.serviceType.split(' ')[0]}</div>
                        <div style={{ fontWeight: 500, color: job.status === 'Completed' ? '#065F46' : 'var(--slate)' }}>{job.status}{job.timeSlot === 'Flexible' ? ' · Flexible' : ''}</div>
                      </div>
                    ))}
                    {dayJobs.length === 0 && <span style={{ fontSize: 11, color: 'var(--mist)' }}>—</span>}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── INVOICES PANEL ───────────────────────────────────────────────────────────
const InvoicesPanel: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  const { currentUser, serviceInvoices, createServiceInvoice, sendServiceInvoice, updateServiceInvoice, addNotification } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setToast({ message: msg, type, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  // Edit invoice state
  const [editInvoiceId, setEditInvoiceId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editSubtotal, setEditSubtotal] = useState('');
  const editInvoice = serviceInvoices.find(i => i.id === editInvoiceId);

  const openEditInvoice = (invId: string) => {
    const inv = serviceInvoices.find(i => i.id === invId);
    if (!inv) return;
    setEditInvoiceId(invId);
    setEditNotes(inv.notes || '');
    setEditSubtotal(String(inv.subtotal));
  };

  const handleSaveEditInvoice = () => {
    if (!editInvoiceId || !editInvoice) return;
    const newSubtotal = parseFloat(editSubtotal) || editInvoice.subtotal;
    const newBalance = newSubtotal - editInvoice.reservationFeePaid;
    updateServiceInvoice(editInvoiceId, { notes: editNotes || undefined, subtotal: newSubtotal, totalAmount: newSubtotal, balanceDue: newBalance > 0 ? newBalance : 0 });
    setEditInvoiceId(null);
    showToast('Invoice updated.');
  };

  const myInvoices = serviceInvoices.filter(i => i.operatorId === currentUser?.id);
  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleCreate = () => {
    if (!selectedJob || !currentUser) return;
    const li: InvoiceLineItem[] = [{
      id: '1', description: `${selectedJob.serviceType} — ${selectedJob.acType} (×${selectedJob.numberOfUnits} unit${selectedJob.numberOfUnits > 1 ? 's' : ''})`,
      category: 'Service', quantity: selectedJob.numberOfUnits, unitPrice: selectedJob.totalPrice / selectedJob.numberOfUnits, amount: selectedJob.totalPrice,
    }];
    createServiceInvoice({
      jobId: selectedJob.id, clientId: selectedJob.clientId, clientName: selectedJob.clientName,
      operatorId: currentUser.id, operatorName: `${currentUser.firstName} ${currentUser.lastName}`,
      lineItems: li, subtotal: selectedJob.totalPrice, reservationFeePaid: selectedJob.reservationFee,
      balanceDue: selectedJob.totalPrice - selectedJob.reservationFee, totalAmount: selectedJob.totalPrice,
      status: 'Draft', notes: customNote || undefined,
    });
    setShowCreate(false); setSelectedJobId(''); setCustomNote('');
    showToast('Invoice created. Send it to the client when ready.');
  };

  return (
    <div>
      <Toast {...toast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Invoices</h2>
          <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 4 }}>Formal quotes sent to clients before service. Client can Accept, Request Revision, or Cancel.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowCreate(true)}>+ Create Invoice</Button>
      </div>

      {myInvoices.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
          <p style={{ color: 'var(--slate)', marginBottom: 20 }}>No invoices yet. Create one for a confirmed job.</p>
          <Button variant="secondary" onClick={() => setShowCreate(true)}>+ Create First Invoice</Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myInvoices.map(inv => (
            <InvoiceCard
              key={inv.id}
              invoice={inv}
              viewerRole="operator"
              onSend={() => { sendServiceInvoice(inv.id); showToast('Invoice sent to client!'); }}
              onEdit={() => openEditInvoice(inv.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Invoice Modal */}
      <Modal open={!!editInvoiceId} onClose={() => setEditInvoiceId(null)} title="Edit Invoice" maxWidth={440}>
        {editInvoice && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: 'var(--midnight)', marginBottom: 6 }}>{editInvoice.id} — {editInvoice.clientName}</div>
              <div style={{ color: 'var(--slate)' }}>Current status: <strong>{editInvoice.status}</strong></div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Notes to Client</label>
              <textarea
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Add or update notes for the client..."
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Subtotal / Total Amount (₱)</label>
              <input
                type="number"
                value={editSubtotal}
                onChange={e => setEditSubtotal(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
              <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 4 }}>
                Reservation paid: ₱{editInvoice.reservationFeePaid.toLocaleString()} · New balance: ₱{Math.max(0, (parseFloat(editSubtotal) || editInvoice.subtotal) - editInvoice.reservationFeePaid).toLocaleString()}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={handleSaveEditInvoice}>Save Changes</Button>
              <Button variant="ghost" onClick={() => setEditInvoiceId(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Service Invoice" maxWidth={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Job *</label>
            <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', background: 'white', outline: 'none' }}>
              <option value="">Choose a job...</option>
              {jobs.filter(j => !['Cancelled', 'Completed'].includes(j.status)).map(j => (
                <option key={j.id} value={j.id}>{j.id} — {j.clientName} · {j.serviceType} · ₱{j.totalPrice.toLocaleString()}</option>
              ))}
            </select>
          </div>
          {selectedJob && (
            <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 6 }}>Invoice Preview</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.8 }}>
                Service: <strong>{selectedJob.serviceType}</strong><br />
                Units: <strong>{selectedJob.numberOfUnits} × {selectedJob.acType}</strong><br />
                Total: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--polar)' }}>₱{selectedJob.totalPrice.toLocaleString()}</strong><br />
                Reservation Paid: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--verified)' }}>₱{selectedJob.reservationFee.toLocaleString()}</strong><br />
                Balance Due: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--polar)' }}>₱{(selectedJob.totalPrice - selectedJob.reservationFee).toLocaleString()}</strong>
              </div>
            </div>
          )}
          <Input label="Note to Client (optional)" value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="e.g. Price per unit is fixed. Additional charges apply if extra units found." />
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={handleCreate} disabled={!selectedJobId}>Create Invoice</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── BILLING PANEL ────────────────────────────────────────────────────────────
const BillingPanel: React.FC<{ jobs: Job[] }> = ({ jobs }) => {
  const { currentUser, billingStatements, createBillingStatement, updateBillingStatement, submitBillingToAdmin } = useStore();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [workNotes, setWorkNotes] = useState('');
  const [extraDesc, setExtraDesc] = useState('');
  const [extraAmt, setExtraAmt] = useState('');
  const [editBillingId, setEditBillingId] = useState<string | null>(null);
  const [editWorkNotes, setEditWorkNotes] = useState('');
  const [editExtraDesc, setEditExtraDesc] = useState('');
  const [editExtraAmt, setEditExtraAmt] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const showToast = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => { setToast({ message: msg, type, visible: true }); setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000); };

  const myBilling = billingStatements.filter(b => b.operatorId === currentUser?.id);
  const selectedJob = jobs.find(j => j.id === selectedJobId);
  const editBilling = billingStatements.find(b => b.id === editBillingId);

  const openEditBilling = (id: string) => {
    const bill = billingStatements.find(b => b.id === id);
    if (!bill) return;
    setEditBillingId(id);
    setEditWorkNotes(bill.workNotes || '');
    const extra = bill.lineItems[1];
    setEditExtraDesc(extra?.description || '');
    setEditExtraAmt(extra ? String(extra.amount) : '');
  };

  const handleSaveEditBilling = () => {
    if (!editBillingId || !editBilling) return;
    const base = editBilling.lineItems[0];
    const extraAmount = parseFloat(editExtraAmt) || 0;
    const items: InvoiceLineItem[] = [
      base,
      ...(extraAmount > 0 && editExtraDesc.trim() ? [{ id: '2', description: editExtraDesc.trim(), category: 'Parts' as const, quantity: 1, unitPrice: extraAmount, amount: extraAmount }] : []),
    ];
    const subtotal = base.amount + (extraAmount > 0 && editExtraDesc.trim() ? extraAmount : 0);
    updateBillingStatement(editBillingId, {
      workNotes: editWorkNotes.trim() || undefined,
      lineItems: items,
      subtotal,
      totalAmount: subtotal,
      amountDue: Math.max(0, subtotal - editBilling.reservationFeePaid),
    });
    setEditBillingId(null);
    showToast('Billing statement updated.');
  };

  const handleCreate = () => {
    if (!selectedJob || !currentUser) return;
    const extraAmount = parseFloat(extraAmt) || 0;
    const items: InvoiceLineItem[] = [
      { id: '1', description: `${selectedJob.serviceType} — ${selectedJob.acType} (×${selectedJob.numberOfUnits} unit${selectedJob.numberOfUnits > 1 ? 's' : ''})`, category: 'Service', quantity: selectedJob.numberOfUnits, unitPrice: selectedJob.totalPrice / selectedJob.numberOfUnits, amount: selectedJob.totalPrice },
      ...(extraAmount > 0 && extraDesc ? [{ id: '2', description: extraDesc, category: 'Parts' as const, quantity: 1, unitPrice: extraAmount, amount: extraAmount }] : []),
    ];
    const subtotal = selectedJob.totalPrice + extraAmount;
    createBillingStatement({
      jobId: selectedJob.id, clientId: selectedJob.clientId, clientName: selectedJob.clientName,
      operatorId: currentUser.id, operatorName: `${currentUser.firstName} ${currentUser.lastName}`,
      technicianName: selectedJob.technicianName,
      lineItems: items, subtotal, reservationFeePaid: selectedJob.reservationFee,
      amountDue: subtotal - selectedJob.reservationFee, totalAmount: subtotal,
      status: 'Draft', workNotes: workNotes || undefined,
    });
    setShowCreate(false); setSelectedJobId(''); setWorkNotes(''); setExtraDesc(''); setExtraAmt('');
    showToast('Billing statement created as Draft. Review and submit to Admin when ready.');
  };

  return (
    <div>
      <Toast {...toast} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)' }}>Billing Statements</h2>
          <p style={{ fontSize: 14, color: 'var(--slate)', marginTop: 4 }}>Post-service billing records. Submit to admin for review, then admin sends to client.</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowCreate(true)}>+ Create Billing</Button>
      </div>

      {myBilling.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💼</div>
          <p style={{ color: 'var(--slate)', marginBottom: 20 }}>No billing statements yet. Create one after completing a service.</p>
          <Button variant="secondary" onClick={() => setShowCreate(true)}>+ Create Billing Statement</Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myBilling.map(bill => (
            <BillingCard
              key={bill.id}
              billing={bill}
              viewerRole="operator"
              onSubmitToAdmin={() => { submitBillingToAdmin(bill.id); showToast('Billing submitted to admin for review.'); }}
              onEdit={() => openEditBilling(bill.id)}
            />
          ))}
        </div>
      )}

      {/* Edit Billing Modal */}
      <Modal open={!!editBillingId} onClose={() => setEditBillingId(null)} title="Edit Billing Statement" maxWidth={460}>
        {editBilling && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 700, color: 'var(--midnight)', marginBottom: 6 }}>{editBilling.id} — {editBilling.clientName}</div>
              <div style={{ color: 'var(--slate)' }}>Current status: <strong>{editBilling.status}</strong></div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8 }}>Work Notes</label>
              <textarea
                value={editWorkNotes}
                onChange={e => setEditWorkNotes(e.target.value)}
                placeholder="Describe work performed, issues found, condition of units..."
                rows={3}
                style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', fontSize: 13, resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => { e.target.style.borderColor = 'var(--polar)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; }}
              />
            </div>
            <div style={{ background: 'var(--breeze)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 8 }}>Additional Charge (optional)</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
                <Input label="" value={editExtraDesc} onChange={e => setEditExtraDesc(e.target.value)} placeholder="e.g. Anti-bacterial treatment" />
                <div style={{ minWidth: 100 }}>
                  <Input label="" type="number" value={editExtraAmt} onChange={e => setEditExtraAmt(e.target.value)} placeholder="₱ amount" />
                </div>
              </div>
            </div>
            <div style={{ background: 'white', border: '1px solid var(--mist)', borderRadius: 12, padding: 14, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate)' }}>Service total</span><span style={{ fontFamily: 'var(--font-mono)' }}>₱{editBilling.lineItems[0].amount.toLocaleString()}</span></div>
              {(parseFloat(editExtraAmt) || 0) > 0 && editExtraDesc.trim() && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate)' }}>Additional</span><span style={{ fontFamily: 'var(--font-mono)' }}>₱{(parseFloat(editExtraAmt) || 0).toLocaleString()}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6, fontWeight: 700 }}>
                <span>New Balance Due</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--polar)' }}>₱{Math.max(0, editBilling.lineItems[0].amount + ((parseFloat(editExtraAmt) || 0) > 0 && editExtraDesc.trim() ? (parseFloat(editExtraAmt) || 0) : 0) - editBilling.reservationFeePaid).toLocaleString()}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="secondary" fullWidth onClick={handleSaveEditBilling}>Save Changes</Button>
              <Button variant="ghost" onClick={() => setEditBillingId(null)}>Cancel</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Billing Statement" maxWidth={480}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Completed/Active Job *</label>
            <select value={selectedJobId} onChange={e => setSelectedJobId(e.target.value)} style={{ width: '100%', padding: '12px 16px', border: '1.5px solid var(--border)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--ink)', background: 'white', outline: 'none' }}>
              <option value="">Choose a job...</option>
              {jobs.filter(j => ['Active', 'Completed'].includes(j.status)).map(j => (
                <option key={j.id} value={j.id}>{j.id} — {j.clientName} · {j.serviceType} · {j.status}</option>
              ))}
            </select>
          </div>
          <Input label="Work Notes *" value={workNotes} onChange={e => setWorkNotes(e.target.value)} placeholder="Describe work performed, any issues found, condition of units..." />
          <div style={{ background: 'var(--breeze)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--midnight)', marginBottom: 8 }}>Additional Charges (optional)</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10 }}>
              <Input label="" value={extraDesc} onChange={e => setExtraDesc(e.target.value)} placeholder="e.g. Anti-bacterial treatment" />
              <div style={{ minWidth: 100 }}>
                <Input label="" type="number" value={extraAmt} onChange={e => setExtraAmt(e.target.value)} placeholder="₱ amount" />
              </div>
            </div>
          </div>
          {selectedJob && (
            <div style={{ background: 'white', border: '1px solid var(--mist)', borderRadius: 12, padding: 14, fontSize: 13 }}>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Summary</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate)' }}>Service total</span><span style={{ fontFamily: 'var(--font-mono)' }}>₱{selectedJob.totalPrice.toLocaleString()}</span></div>
              {parseFloat(extraAmt) > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--slate)' }}>Additional</span><span style={{ fontFamily: 'var(--font-mono)' }}>₱{parseFloat(extraAmt).toLocaleString()}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', marginTop: 6, paddingTop: 6, fontWeight: 700 }}><span>Balance Due</span><span style={{ fontFamily: 'var(--font-mono)', color: 'var(--polar)' }}>₱{(selectedJob.totalPrice + (parseFloat(extraAmt) || 0) - selectedJob.reservationFee).toLocaleString()}</span></div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="secondary" fullWidth onClick={handleCreate} disabled={!selectedJobId || !workNotes.trim()}>Create Statement</Button>
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// ─── PROFILE PANEL ────────────────────────────────────────────────────────────
const ProfilePanel: React.FC = () => {
  const { currentUser } = useStore();
  if (!currentUser) return null;

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--midnight)', marginBottom: 24 }}>My Profile</h2>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, var(--polar), var(--frost))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>
            {currentUser.firstName[0]}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'var(--midnight)' }}>{currentUser.firstName} {currentUser.lastName}</div>
            <div style={{ fontSize: 13, color: 'var(--slate)' }}>{currentUser.email} · {currentUser.phone}</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
              <span style={{ background: 'rgba(10,110,143,0.1)', color: 'var(--polar)', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Operator</span>
              <span style={{ background: 'var(--verified-bg)', color: 'var(--verified)', fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{currentUser.operatorStatus || 'Active'}</span>
            </div>
          </div>
        </div>
        {[
          { label: 'Employee ID', value: currentUser.id },
          { label: 'Assigned Cities', value: (currentUser.assignedCities || []).join(', ') || 'Not assigned' },
          { label: 'Member Since', value: new Date(currentUser.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
        ].map(r => (
          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--slate)', fontWeight: 600 }}>{r.label}</span>
            <span style={{ fontSize: 13, color: 'var(--ink)', fontFamily: r.label === 'Employee ID' ? 'var(--font-mono)' : 'var(--font-body)', fontWeight: 500 }}>{r.value}</span>
          </div>
        ))}
      </Card>
      <div style={{ background: 'var(--breeze)', borderRadius: 14, padding: '16px 20px', fontSize: 13, color: 'var(--slate)', lineHeight: 1.7 }}>
        💡 Need to update your profile or request reassignment? Contact your ACT Admin at <strong style={{ color: 'var(--polar)' }}>admin@act.ph</strong>
      </div>
    </div>
  );
};

// ─── MAIN OPERATOR DASHBOARD ───────────────────────────────────────────────────
const OperatorDashboard: React.FC = () => {
  const router = useRouter();
  const { currentUser, jobs, messages, hydrate } = useStore();
  const { isMobile, isTablet } = useBreakpoint();
  const isNarrow = isMobile || isTablet;

  const [activePanel, setActivePanel] = useState('today');
  const [openMessageJobId, setOpenMessageJobId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!currentUser) {
      router.push('/login');
    } else if (currentUser.role !== 'operator') {
      router.push(currentUser.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [currentUser, router]);

  // Hydrate from the server (system of record) + run 7-day chat retention job
  useEffect(() => { hydrate(); }, [hydrate]);

  if (!currentUser || currentUser.role !== 'operator') return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--midnight)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 40, height: 40, border: '3px solid var(--frost)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-body)', fontSize: 14 }}>Redirecting…</p>
      </div>
    </div>
  );

  // Operator's assigned jobs
  const myJobs = jobs.filter(j => j.operatorId === currentUser.id);

  // Unread messages across all my jobs
  const unreadCount = messages.filter(m =>
    myJobs.some(j => j.id === m.jobId) && !m.readBy.includes(currentUser.id)
  ).length;

  // When "Message" is clicked from jobs panel
  const handleOpenMessages = (jobId: string) => {
    setOpenMessageJobId(jobId);
    setActivePanel('messages');
  };

  const renderPanel = () => {
    switch (activePanel) {
      case 'today': return <TodayPanel jobs={myJobs} onNav={setActivePanel} />;
      case 'jobs': return <MyJobsPanel jobs={myJobs} onOpenMessages={handleOpenMessages} />;
      case 'messages': return <MessagesPanel jobs={myJobs} initialJobId={openMessageJobId} />;
      case 'invoices': return <InvoicesPanel jobs={myJobs} />;
      case 'billing': return <BillingPanel jobs={myJobs} />;
      case 'schedule': return <SchedulePanel jobs={myJobs} />;
      case 'profile': return <ProfilePanel />;
      default: return <TodayPanel jobs={myJobs} onNav={setActivePanel} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cloud)', fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <div style={{
        position: isNarrow ? 'sticky' : 'fixed',
        top: 0, left: 0,
        width: isNarrow ? '100%' : 240,
        height: isNarrow ? 'auto' : '100vh',
        zIndex: 50,
        overflowY: isNarrow ? 'hidden' : 'auto',
        overflowX: isNarrow ? 'auto' : 'hidden',
      }}>
        <Sidebar active={activePanel} onNav={(v) => { setActivePanel(v); setOpenMessageJobId(null); }} unreadCount={unreadCount} />
      </div>

      {/* Main content */}
      <main style={{ marginLeft: isNarrow ? 0 : 240, minHeight: '100vh', background: 'var(--cloud)' }}>
        <div style={{ padding: isNarrow ? '16px' : '28px 32px' }}>
          {renderPanel()}
        </div>
      </main>
    </div>
  );
};

export default OperatorDashboard;
