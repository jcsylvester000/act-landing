'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, SERVICE_PRICING, QUOTE_REQUIRED_SERVICES } from '@/store';
import type { ServiceType, ACType, CoverageCity, TimeSlot } from '@/store';
import { Button, Input, Select, Textarea, Toast } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

// Actual ACT service area — South Metro Manila / South Laguna
const CITIES: CoverageCity[] = ['Biñan', 'San Pedro', 'Sta. Rosa', 'Cabuyao', 'Muntinlupa', 'Carmona', 'GMA Cavite'];

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ current: number }> = ({ current }) => {
  const steps = [
    { label: 'Service', icon: '🔧' },
    { label: 'Location', icon: '📍' },
    { label: 'Schedule', icon: '📅' },
    { label: 'Confirm', icon: '✅' },
    { label: 'Pay', icon: '💳' },
  ];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 44, overflowX: 'auto', paddingBottom: 4 }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.label}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flexShrink: 0 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: i < current ? 'var(--verified)' : i === current ? 'linear-gradient(135deg, var(--polar), var(--polar-dark))' : 'var(--snow)',
              color: i <= current ? 'white' : 'var(--slate)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: i < current ? 18 : 19,
              transition: 'all 0.35s var(--ease-out)',
              boxShadow: i === current ? '0 4px 14px rgba(10,110,143,0.3)' : i < current ? '0 4px 12px rgba(27,168,126,0.25)' : 'none',
              border: i > current ? '1.5px solid var(--border)' : 'none',
            }}>
              {i < current ? '✓' : s.icon}
            </div>
            <span className="step-label" style={{
              fontSize: 11, fontWeight: i === current ? 800 : 600,
              color: i === current ? 'var(--polar)' : i < current ? 'var(--verified)' : 'var(--slate)',
              whiteSpace: 'nowrap', letterSpacing: i === current ? '0.3px' : '0',
            }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, minWidth: 20,
              background: i < current ? 'var(--verified)' : 'var(--border)',
              margin: '-18px 10px 0',
              transition: 'background 0.4s',
              borderRadius: 99,
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── PRICE SUMMARY ────────────────────────────────────────────────────────────
const PriceSummary: React.FC<{ serviceType: ServiceType; acType: ACType; units: number }> = ({ serviceType, acType, units }) => {
  const isQuote = QUOTE_REQUIRED_SERVICES.includes(serviceType);
  if (isQuote) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', border: '1.5px solid #FCD34D', borderRadius: 14, padding: 20, marginTop: 20 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#92400E', marginBottom: 8 }}>⚡ Quote-Based Service</h4>
        <p style={{ fontSize: 13, color: '#78350F', lineHeight: 1.6 }}>
          Pricing for <strong>{serviceType}</strong> depends on the scope of work. Our admin will review your request, contact you within the day to discuss pricing, and send a formal quote before any work begins.
        </p>
        <div style={{ marginTop: 10, fontSize: 12, color: '#92400E', fontWeight: 600 }}>✓ No payment required to submit your request</div>
      </div>
    );
  }
  if (!serviceType || !acType || !units) return null;
  const pricing = SERVICE_PRICING[serviceType]?.[acType];
  if (!pricing || pricing.price === 0) return null;
  const total = pricing.price * units;
  return (
    <div style={{ background: 'var(--breeze)', border: '1.5px solid var(--mist)', borderRadius: 14, padding: 20, marginTop: 20 }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--midnight)', marginBottom: 12 }}>Price Summary</h4>
      {[
        { label: `${serviceType} (${acType})`, value: `₱${pricing.price.toLocaleString()} × ${units}` },
        { label: 'Total', value: `₱${total.toLocaleString()}`, bold: true },
        { label: 'Balance collected after service', value: `₱${total.toLocaleString()}` },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: r.bold ? 'var(--ink)' : 'var(--slate)' }}>{r.label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: r.bold ? 700 : 500, color: 'var(--ink)' }}>{r.value}</span>
        </div>
      ))}
      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px dashed var(--mist)', fontSize: 12, color: 'var(--slate)' }}>
        ✓ No upfront payment — our admin will confirm your booking and discuss payment options with you.
      </div>
    </div>
  );
};

// ─── BOOKING PAGE ─────────────────────────────────────────────────────────────
const BookingPage: React.FC = () => {
  const router = useRouter();
  const { currentUser, technicians, addJob, addNotification, sendMessage } = useStore();
  const { isMobile } = useBreakpoint();

  // ─── ALL STATE UP TOP (Rules of Hooks) ────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const [serviceType, setServiceType] = useState<ServiceType>('Basic Cleaning');
  const [acType, setAcType] = useState<ACType>('Split Type');
  const [units, setUnits] = useState(1);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<CoverageCity>('Biñan');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('AM');
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Cash' | 'Bank Transfer'>('GCash');
  const [submitting, setSubmitting] = useState(false);
  const [completedJob, setCompletedJob] = useState<ReturnType<typeof addJob> | null>(null);
  const [preferredTechId, setPreferredTechId] = useState('');

  const isQuote = QUOTE_REQUIRED_SERVICES.includes(serviceType);

  // ─── AUTH GUARD ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/book');
    } else {
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.city) setCity(currentUser.city as CoverageCity || 'Biñan');
      // Pre-select preferred tech if client has one
      if (currentUser.preferredTechnicianId) setPreferredTechId(currentUser.preferredTechnicianId);
      setAuthChecked(true);
    }
  }, [currentUser, router]);

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const pricing = SERVICE_PRICING[serviceType]?.[acType];
  const totalPrice = (pricing && pricing.price > 0) ? pricing.price * units : 0;
  const reservationFee = 0; // Reservation fee removed per client feedback — clients react negatively
  const balanceDue = totalPrice;

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!currentUser) { router.push('/login?redirect=/book'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const dueDate = new Date(preferredDate);
    dueDate.setDate(dueDate.getDate() + (serviceType === 'Basic Cleaning' ? 90 : 180));

    const preferredTech = technicians.find(t => t.id === preferredTechId);

    const job = addJob({
      clientId: currentUser.id,
      clientName: `${currentUser.firstName} ${currentUser.lastName}`,
      serviceType, acType,
      numberOfUnits: units,
      serviceAddress: address, city,
      preferredDate, timeSlot,
      totalPrice, reservationFee: 0, balanceDue,
      paymentStatus: isQuote ? 'Unpaid' : (paymentMethod === 'Cash' ? 'Unpaid' : 'Awaiting Confirmation'),
      status: 'Pending',
      specialInstructions,
      nextDueDate: !isQuote ? dueDate.toISOString().split('T')[0] : undefined,
      requiresQuote: isQuote,
      preferredTechnicianId: preferredTechId || undefined,
      preferredTechnicianName: preferredTech?.fullName,
    });

    addNotification({
      userId: currentUser.id, jobId: job.id,
      message: isQuote
        ? `Quote request ${job.id} submitted! Our admin will contact you within the day to discuss pricing.`
        : `Booking ${job.id} received! Our admin will confirm your schedule shortly.`,
      type: 'success', read: false,
    });

    // Auto-send welcome message from admin
    sendMessage({
      jobId: job.id,
      senderId: 'ADMIN001',
      senderName: 'ACT Admin',
      senderRole: 'admin',
      type: 'text',
      content: isQuote
        ? `Hi ${currentUser.firstName}! Got your ${serviceType} request. I'll review the details and contact you today to discuss the scope and pricing. Thank you for choosing ACT! 🙏`
        : `Hi ${currentUser.firstName}! Thank you for booking with ACT. I'm checking technician availability for ${preferredDate} and will confirm your schedule shortly!${preferredTech ? ` You've requested ${preferredTech.fullName} — I'll do my best to assign them.` : ''}`,
      readBy: ['ADMIN001'],
    });

    setCompletedJob(job);
    setSubmitting(false);
    setStep(5);
  };

  // ─── LOADING STATE (auth not yet resolved) ────────────────────────────────
  if (!authChecked || !currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cloud)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--polar)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--slate)', fontFamily: 'var(--font-body)', fontSize: 14 }}>Checking your account…</p>
        </div>
      </div>
    );
  }

  // ─── SUCCESS SCREEN ───────────────────────────────────────────────────────
  if (step === 5 && completedJob) {
    const wasQuote = completedJob.requiresQuote;
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cloud)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'fadeInUp 0.5s ease both' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: wasQuote ? '#F59E0B' : 'var(--verified)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', boxShadow: wasQuote ? '0 8px 24px rgba(245,158,11,0.3)' : '0 8px 24px rgba(27,168,126,0.3)' }}>
            {wasQuote ? '⚡' : '✓'}
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--midnight)', marginBottom: 8 }}>
            {wasQuote ? 'Request Submitted!' : 'Booking Received!'}
          </h2>
          <p style={{ color: 'var(--slate)', marginBottom: 32, lineHeight: 1.7 }}>
            {wasQuote
              ? 'Our admin will review your request and reach out via in-app message within the day to discuss pricing and schedule.'
              : 'Our admin will confirm your booking and assign a technician. You\'ll get a message here with all the details.'
            }
          </p>
          <div style={{ background: 'white', border: '1px solid var(--mist)', borderRadius: 16, padding: 24, marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--polar)', fontWeight: 600, marginBottom: 16, background: 'var(--breeze)', padding: '8px 12px', borderRadius: 8, display: 'inline-block' }}>
              REF: {completedJob.id}
            </div>
            {[
              { l: 'Service', v: `${completedJob.serviceType} — ${completedJob.acType}` },
              { l: 'Units', v: `${completedJob.numberOfUnits} unit${completedJob.numberOfUnits > 1 ? 's' : ''}` },
              { l: 'Date', v: completedJob.preferredDate },
              { l: 'Time Slot', v: completedJob.timeSlot },
              { l: 'Location', v: `${completedJob.serviceAddress}, ${completedJob.city}` },
              { l: 'Total', v: `₱${completedJob.totalPrice.toLocaleString()}` },
              { l: 'Reservation Fee', v: `₱${completedJob.reservationFee.toLocaleString()} (${paymentMethod})` },
            ].map(r => (
              <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, borderBottom: '1px solid var(--border)', paddingBottom: 8 }}>
                <span style={{ color: 'var(--slate)', fontWeight: 600 }}>{r.l}</span>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.v}</span>
              </div>
            ))}
          </div>
          {/* What happens next */}
          <div style={{ background: 'var(--breeze)', border: '1px solid var(--mist)', borderRadius: 14, padding: 18, marginBottom: 28, textAlign: 'left' }}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--midnight)', marginBottom: 10 }}>What happens next?</div>
            {[
              { num: '1', text: 'Our team verifies your payment (within 1 hour)' },
              { num: '2', text: 'A certified technician is assigned to your job' },
              { num: '3', text: 'You receive a confirmation with technician details' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--polar)', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{s.num}</div>
                <span style={{ fontSize: 13, color: 'var(--slate)' }}>{s.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button variant="secondary" onClick={() => router.push('/dashboard')}>View Dashboard</Button>
            <Button variant="ghost" onClick={() => router.push('/jobs')}>My Bookings</Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN BOOKING FORM ────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--cloud)', padding: '100px 24px 40px' }}>
      <Toast {...toast} />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: isMobile ? '0 12px' : '0' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--midnight)', marginBottom: 8 }}>Book a Service</h1>
          <p style={{ color: 'var(--slate)' }}>Transparent pricing. Accredited technicians. Confirmed in minutes.</p>
        </div>

        <div style={{ background: 'white', borderRadius: 24, border: '1px solid var(--mist)', padding: isMobile ? '24px 20px' : 36 }}>
          <StepIndicator current={step} />

          {/* ─── STEP 0: SERVICE ─── */}
          {step === 0 && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--midnight)', marginBottom: 8 }}>What service do you need?</h3>
              <p style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 20 }}>Select your service type, AC type, and number of units.</p>

              {/* Fixed-price services */}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Cleaning Services — Fixed Pricing</div>
              <div className="booking-service-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                {(['Basic Cleaning', 'Deep Clean / Chemical Wash'] as ServiceType[]).map(s => (
                  <button key={s} onClick={() => setServiceType(s)} style={{
                    padding: 20, borderRadius: 14,
                    border: `2px solid ${serviceType === s ? 'var(--polar)' : 'var(--mist)'}`,
                    background: serviceType === s ? 'var(--breeze)' : 'white',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    boxShadow: serviceType === s ? '0 0 0 3px rgba(10,110,143,0.08)' : 'none',
                  }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{s === 'Basic Cleaning' ? '🧹' : '💧'}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: serviceType === s ? 'var(--polar)' : 'var(--midnight)', marginBottom: 4 }}>{s}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{s === 'Basic Cleaning' ? 'Filters, coils & drain' : 'Full chemical wash & disinfection'}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--polar)', marginTop: 10, fontWeight: 700 }}>from ₱{s === 'Basic Cleaning' ? '1,200' : '2,000'}/unit</div>
                  </button>
                ))}
              </div>

              {/* Quote-based services */}
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--slate)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 }}>Other Services — Quote Required</div>
              <div className="booking-service-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {([
                  { s: 'AC Installation' as ServiceType, icon: '⚡', desc: 'New unit installation' },
                  { s: 'Repair & Diagnostics' as ServiceType, icon: '🔧', desc: 'Troubleshooting & fixes' },
                  { s: 'Refrigerant Recharge' as ServiceType, icon: '❄️', desc: 'Freon / R410A top-up' },
                ]).map(({ s, icon, desc }) => (
                  <button key={s} onClick={() => setServiceType(s)} style={{ padding: '16px 12px', borderRadius: 14, border: `2px solid ${serviceType === s ? '#F59E0B' : 'var(--mist)'}`, background: serviceType === s ? '#FFFBEB' : 'white', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: serviceType === s ? '#92400E' : 'var(--midnight)', marginBottom: 3 }}>{s}</div>
                    <div style={{ fontSize: 11, color: 'var(--slate)' }}>{desc}</div>
                    <div style={{ fontSize: 11, color: '#B45309', marginTop: 8, fontWeight: 700 }}>Quote-based</div>
                  </button>
                ))}
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>AC Type</label>
                <div className="booking-ac-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {(['Split Type', 'Window Type', 'Cassette Type'] as ACType[]).map(t => (
                    <button key={t} onClick={() => setAcType(t)} style={{
                      padding: '16px 10px', borderRadius: 12,
                      border: `2px solid ${acType === t ? 'var(--polar)' : 'var(--mist)'}`,
                      background: acType === t ? 'var(--breeze)' : 'white', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 700,
                      color: acType === t ? 'var(--polar)' : 'var(--ink)', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{t === 'Split Type' ? '🌬️' : t === 'Window Type' ? '🪟' : '🔲'}</div>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Number of Units</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <button onClick={() => setUnits(Math.max(1, units - 1))} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--mist)', background: 'white', cursor: 'pointer', fontSize: 22, color: 'var(--polar)', fontWeight: 700, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--polar)'; e.currentTarget.style.background = 'var(--breeze)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--mist)'; e.currentTarget.style.background = 'white'; }}>−</button>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--midnight)', minWidth: 40, textAlign: 'center' }}>{units}</span>
                  <button onClick={() => setUnits(units + 1)} style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid var(--mist)', background: 'white', cursor: 'pointer', fontSize: 22, color: 'var(--polar)', fontWeight: 700, transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--polar)'; e.currentTarget.style.background = 'var(--breeze)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--mist)'; e.currentTarget.style.background = 'white'; }}>+</button>
                  <span style={{ fontSize: 13, color: 'var(--slate)' }}>{units} unit{units > 1 ? 's' : ''} selected</span>
                </div>
              </div>

              <PriceSummary serviceType={serviceType} acType={acType} units={units} />
            </div>
          )}

          {/* ─── STEP 1: LOCATION ─── */}
          {step === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease both', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--midnight)', marginBottom: 4 }}>Where should we go?</h3>
                <p style={{ fontSize: 13, color: 'var(--slate)' }}>We&apos;ll send a certified technician to your address.</p>
              </div>
              <Input label="Full Service Address *" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 45 Katipunan Ave, Unit 301, Barangay Blue Ridge" hint="Include unit number, floor, building name, and barangay." />
              <Select label="City *" value={city} onChange={e => setCity(e.target.value as CoverageCity)}
                options={CITIES.map(c => ({ value: c, label: c }))} />
              <Textarea label="Special Instructions (optional)" value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                placeholder="Gate code, parking instructions, unit location inside building, pet in yard, etc." />
              <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--polar)', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span>📍</span>
                <span>Currently serving: <strong>{CITIES.join(' · ')}</strong></span>
              </div>
            </div>
          )}

          {/* ─── STEP 2: SCHEDULE ─── */}
          {step === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease both', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--midnight)', marginBottom: 4 }}>When works for you?</h3>
                <p style={{ fontSize: 13, color: 'var(--slate)' }}>Choose your preferred date and time window.</p>
              </div>
              <Input label="Preferred Service Date *" type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} min={getMinDate()} hint="Admin will confirm availability and assign a technician based on this date." />
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Time Slot</label>
                <div className="booking-ac-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {([
                    { slot: 'AM' as TimeSlot, icon: '🌅', label: 'Morning', sub: '8AM – 12PM' },
                    { slot: 'PM' as TimeSlot, icon: '☀️', label: 'Afternoon', sub: '1PM – 5PM' },
                    { slot: 'Flexible' as TimeSlot, icon: '🕐', label: 'Flexible', sub: 'Either slot' },
                  ]).map(ts => (
                    <button key={ts.slot} onClick={() => setTimeSlot(ts.slot)} style={{ padding: '16px 10px', borderRadius: 12, border: `2px solid ${timeSlot === ts.slot ? 'var(--polar)' : 'var(--mist)'}`, background: timeSlot === ts.slot ? 'var(--breeze)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 700, color: timeSlot === ts.slot ? 'var(--polar)' : 'var(--ink)', transition: 'all 0.2s' }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{ts.icon}</div>
                      <div style={{ fontSize: 14 }}>{ts.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: timeSlot === ts.slot ? 'var(--polar-dark)' : 'var(--slate)', marginTop: 3 }}>{ts.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred technician selection */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Preferred Technician <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--slate)', textTransform: 'none', letterSpacing: 0 }}>— optional</span>
                </label>
                <p style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 10 }}>Returning client? Request the technician you already know and trust.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button onClick={() => setPreferredTechId('')} style={{ padding: '10px 14px', borderRadius: 10, border: `2px solid ${!preferredTechId ? 'var(--polar)' : 'var(--mist)'}`, background: !preferredTechId ? 'var(--breeze)' : 'white', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: !preferredTechId ? 'var(--polar)' : 'var(--ink)' }}>
                    No preference — assign best available
                  </button>
                  {technicians.filter(t => t.active).map(tech => (
                    <button key={tech.id} onClick={() => setPreferredTechId(tech.id)} style={{ padding: '10px 14px', borderRadius: 10, border: `2px solid ${preferredTechId === tech.id ? 'var(--polar)' : 'var(--mist)'}`, background: preferredTechId === tech.id ? 'var(--breeze)' : 'white', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: preferredTechId === tech.id ? 'var(--polar)' : 'var(--midnight)' }}>{tech.fullName}</div>
                          <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 2 }}>{tech.skillLevel} · ⭐ {tech.averageRating} · {tech.totalJobsCompleted} jobs · {tech.coverageCities.slice(0, 2).join(', ')}</div>
                        </div>
                        {currentUser?.preferredTechnicianId === tech.id && <span style={{ fontSize: 11, background: '#EDE9FE', color: '#5B21B6', padding: '2px 8px', borderRadius: 99, fontWeight: 700, flexShrink: 0 }}>★ Your usual tech</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--slate)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0 }}>ℹ️</span>
                <span>Your schedule is confirmed by our admin after checking technician availability. You&apos;ll receive a message with the confirmed details.</span>
              </div>
            </div>
          )}

          {/* ─── STEP 3: REVIEW ─── */}
          {step === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--midnight)', marginBottom: 4 }}>Review Your Booking</h3>
                <p style={{ fontSize: 13, color: 'var(--slate)' }}>Double-check everything before proceeding to payment.</p>
              </div>
              {[
                { section: '🧹 Service', items: [
                  { l: 'Type', v: serviceType },
                  { l: 'AC Type', v: acType },
                  { l: 'Units', v: `${units} unit${units > 1 ? 's' : ''}` },
                ]},
                { section: '📍 Location', items: [
                  { l: 'Address', v: address },
                  { l: 'City', v: city },
                  ...(specialInstructions ? [{ l: 'Notes', v: specialInstructions }] : []),
                ]},
                { section: '📅 Schedule', items: [
                  { l: 'Date', v: preferredDate },
                  { l: 'Time Slot', v: timeSlot === 'AM' ? 'Morning (8AM–12PM)' : timeSlot === 'PM' ? 'Afternoon (1PM–5PM)' : 'Flexible' },
                ]},
              ].map(s => (
                <div key={s.section} style={{ marginBottom: 14, background: 'var(--cloud)', borderRadius: 14, padding: 18 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--polar)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.section}</div>
                  {s.items.map(r => (
                    <div key={r.l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 14 }}>
                      <span style={{ color: 'var(--slate)' }}>{r.l}</span>
                      <span style={{ fontWeight: 600, color: 'var(--ink)', textAlign: 'right', maxWidth: '60%' }}>{r.v}</span>
                    </div>
                  ))}
                </div>
              ))}
              <PriceSummary serviceType={serviceType} acType={acType} units={units} />
            </div>
          )}

          {/* ─── STEP 4: CONFIRM / PAYMENT ─── */}
          {step === 4 && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              {isQuote ? (
                // Quote-based: no payment required — just submit
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--midnight)', marginBottom: 4 }}>Ready to Submit Your Request</h3>
                    <p style={{ fontSize: 13, color: 'var(--slate)' }}>No payment needed — our admin will contact you within the day to discuss pricing and confirm the schedule.</p>
                  </div>
                  <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFFBEB)', border: '2px solid #FCD34D', borderRadius: 16, padding: '20px 24px', marginBottom: 24 }}>
                    <div style={{ fontWeight: 800, fontSize: 15, color: '#92400E', marginBottom: 12 }}>⚡ What happens after you submit</div>
                    {[
                      { icon: '1', text: 'Our admin reviews your request and checks technician availability' },
                      { icon: '2', text: 'We message you on this platform with pricing and schedule options' },
                      { icon: '3', text: 'You approve the quote before any work begins' },
                      { icon: '4', text: 'Payment is made after service is completed' },
                    ].map(s => (
                      <div key={s.icon} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#F59E0B', color: 'white', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                        <span style={{ fontSize: 13, color: '#78350F', lineHeight: 1.5 }}>{s.text}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 16, fontSize: 13, color: 'var(--slate)', display: 'flex', gap: 8 }}>
                    <span>💬</span>
                    <span>Communication will happen right here on the platform — check your Messages after submitting.</span>
                  </div>
                </div>
              ) : (
                // Fixed-price: show payment method selection
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--midnight)', marginBottom: 4 }}>Payment Preference</h3>
                    <p style={{ fontSize: 13, color: 'var(--slate)' }}>Let us know how you&apos;d like to pay. Payment is collected after service is completed.</p>
                  </div>

                  <div style={{ background: 'var(--breeze)', border: '2px solid var(--polar)', borderRadius: 16, padding: '18px 22px', marginBottom: 24, textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 4 }}>Total Service Cost</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 800, color: 'var(--polar)', lineHeight: 1 }}>₱{totalPrice.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8 }}>Collected after service is completed · No upfront payment</div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>How will you pay?</label>
                    <div className="booking-ac-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {([
                        { method: 'GCash' as const, icon: '📱', label: 'GCash' },
                        { method: 'Bank Transfer' as const, icon: '🏦', label: 'Bank Transfer' },
                        { method: 'Cash' as const, icon: '💵', label: 'Cash on-site' },
                      ]).map(m => (
                        <button key={m.method} onClick={() => setPaymentMethod(m.method)} style={{ padding: 14, borderRadius: 12, border: `2px solid ${paymentMethod === m.method ? 'var(--polar)' : 'var(--mist)'}`, background: paymentMethod === m.method ? 'var(--breeze)' : 'white', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600, color: paymentMethod === m.method ? 'var(--polar)' : 'var(--ink)', transition: 'all 0.2s' }}>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: 14, fontSize: 13, color: 'var(--slate)', display: 'flex', gap: 8 }}>
                    <span>💬</span>
                    <span>After your booking is confirmed, our admin will message you here with the full details. Payment is due after service is done.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── NAVIGATION ─── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, gap: 12 }}>
            {step > 0 ? (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>← Back</Button>
            ) : (
              <div />
            )}
            {step < 4 ? (
              <Button variant="primary" onClick={() => {
                if (step === 1 && !address.trim()) { showToast('Please enter your service address.', 'error'); return; }
                if (step === 2 && !preferredDate) { showToast('Please select a preferred date.', 'error'); return; }
                setStep(step + 1);
              }}>
                {step === 3 ? (isQuote ? 'Review & Submit →' : 'Payment Options →') : 'Continue →'}
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Submitting…' : isQuote ? '⚡ Submit Quote Request' : '✓ Confirm Booking'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
