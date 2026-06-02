'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore, SERVICE_PRICING } from '@/store';
import type { ServiceType, ACType, CoverageCity, TimeSlot } from '@/store';
import { Button, Input, Select, Textarea, Toast } from '@/components/ui';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const CITIES: CoverageCity[] = ['Quezon City', 'Makati', 'Pasig', 'Taguig', 'Mandaluyong', 'Parañaque'];

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
  if (!serviceType || !acType || !units) return null;
  const pricing = SERVICE_PRICING[serviceType]?.[acType];
  if (!pricing) return null;
  const total = pricing.price * units;
  const balance = total - pricing.fee;
  return (
    <div style={{ background: 'var(--breeze)', border: '1.5px solid var(--mist)', borderRadius: 14, padding: 20, marginTop: 20 }}>
      <h4 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--midnight)', marginBottom: 12 }}>Price Summary</h4>
      {[
        { label: `${serviceType} (${acType})`, value: `₱${pricing.price.toLocaleString()} × ${units}` },
        { label: 'Total', value: `₱${total.toLocaleString()}`, bold: true },
        { label: 'Reservation fee (today)', value: `₱${pricing.fee.toLocaleString()}`, color: 'var(--ember)', bold: true },
        { label: 'Balance after service', value: `₱${balance.toLocaleString()}` },
      ].map(r => (
        <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: r.bold ? 'var(--ink)' : 'var(--slate)' }}>{r.label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: r.bold ? 700 : 500, color: r.color || 'var(--ink)' }}>{r.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── BOOKING PAGE ─────────────────────────────────────────────────────────────
const BookingPage: React.FC = () => {
  const router = useRouter();
  const { currentUser, addJob, addNotification } = useStore();
  const { isMobile } = useBreakpoint();

  // ─── ALL STATE UP TOP (Rules of Hooks) ────────────────────────────────────
  const [authChecked, setAuthChecked] = useState(false);
  const [step, setStep] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false });
  const [serviceType, setServiceType] = useState<ServiceType>('Basic Cleaning');
  const [acType, setAcType] = useState<ACType>('Split Type');
  const [units, setUnits] = useState(1);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<CoverageCity>('Quezon City');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('AM');
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Cash' | 'Bank Transfer'>('GCash');
  const [screenshotUploaded, setScreenshotUploaded] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [completedJob, setCompletedJob] = useState<ReturnType<typeof addJob> | null>(null);

  // ─── AUTH GUARD ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentUser) {
      router.push('/login?redirect=/book');
    } else {
      // Pre-fill address and city from user profile if available
      if (currentUser.address) setAddress(currentUser.address);
      if (currentUser.city) setCity(currentUser.city as CoverageCity);
      setAuthChecked(true);
    }
  }, [currentUser, router]);

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3000);
  };

  const pricing = SERVICE_PRICING[serviceType]?.[acType];
  const totalPrice = pricing ? pricing.price * units : 0;
  const reservationFee = pricing?.fee || 0;
  const balanceDue = totalPrice - reservationFee;

  const getMinDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!currentUser) { router.push('/login?redirect=/book'); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const dueDate = new Date(preferredDate);
    dueDate.setDate(dueDate.getDate() + (serviceType === 'Basic Cleaning' ? 90 : 180));

    const job = addJob({
      clientId: currentUser.id,
      clientName: `${currentUser.firstName} ${currentUser.lastName}`,
      serviceType, acType,
      numberOfUnits: units,
      serviceAddress: address, city,
      preferredDate, timeSlot, totalPrice, reservationFee, balanceDue,
      paymentStatus: paymentMethod === 'Cash' ? 'Unpaid' : 'Awaiting Confirmation',
      status: 'Pending',
      specialInstructions,
      nextDueDate: dueDate.toISOString().split('T')[0],
    });

    addNotification({
      userId: currentUser.id, jobId: job.id,
      message: `Booking ${job.id} received! We're reviewing your payment and will confirm shortly.`,
      type: 'success', read: false,
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
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cloud)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px 40px' }}>
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'fadeInUp 0.5s ease both' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--verified)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 24px', boxShadow: '0 8px 24px rgba(27,168,126,0.3)' }}>✓</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--midnight)', marginBottom: 8 }}>Booking Received!</h2>
          <p style={{ color: 'var(--slate)', marginBottom: 32, lineHeight: 1.7 }}>
            Your booking is being reviewed. You&apos;ll receive a confirmation once your payment is verified and a technician is assigned.
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
              <div className="booking-service-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
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
              <Input label="Preferred Service Date *" type="date" value={preferredDate} onChange={e => setPreferredDate(e.target.value)} min={getMinDate()} hint="Minimum 2 business days from today for technician assignment." />
              <div>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Preferred Time Slot</label>
                <div className="booking-ac-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {([
                    { slot: 'AM' as TimeSlot, icon: '🌅', label: 'Morning', sub: '8AM – 12PM' },
                    { slot: 'PM' as TimeSlot, icon: '☀️', label: 'Afternoon', sub: '1PM – 5PM' },
                    { slot: 'Flexible' as TimeSlot, icon: '🕐', label: 'Flexible', sub: 'Either slot' },
                  ]).map(ts => (
                    <button key={ts.slot} onClick={() => setTimeSlot(ts.slot)} style={{
                      padding: '16px 10px', borderRadius: 12,
                      border: `2px solid ${timeSlot === ts.slot ? 'var(--polar)' : 'var(--mist)'}`,
                      background: timeSlot === ts.slot ? 'var(--breeze)' : 'white', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontWeight: 700,
                      color: timeSlot === ts.slot ? 'var(--polar)' : 'var(--ink)', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{ts.icon}</div>
                      <div style={{ fontSize: 14 }}>{ts.label}</div>
                      <div style={{ fontSize: 11, fontWeight: 500, color: timeSlot === ts.slot ? 'var(--polar-dark)' : 'var(--slate)', marginTop: 3 }}>{ts.sub}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--breeze)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--slate)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0 }}>ℹ️</span>
                <span>Your slot is confirmed after payment is verified and a technician is assigned. You&apos;ll receive a confirmation with the technician&apos;s details.</span>
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

          {/* ─── STEP 4: PAYMENT ─── */}
          {step === 4 && (
            <div style={{ animation: 'fadeIn 0.3s ease both' }}>
              <div style={{ marginBottom: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--midnight)', marginBottom: 4 }}>Reservation Fee Payment</h3>
                <p style={{ fontSize: 13, color: 'var(--slate)' }}>Pay the reservation fee to confirm your slot. Balance is collected after service.</p>
              </div>

              {/* Amount highlight */}
              <div style={{ background: 'var(--breeze)', border: '2px solid var(--polar)', borderRadius: 16, padding: '20px 24px', marginBottom: 24, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--slate)', marginBottom: 4 }}>Reservation Fee (Pay Now)</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 800, color: 'var(--polar)', lineHeight: 1 }}>₱{reservationFee.toLocaleString()}</div>
                <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8 }}>
                  Balance of <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>₱{balanceDue.toLocaleString()}</strong> collected after service is completed
                </div>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment Method</label>
                <div className="booking-ac-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {([
                    { method: 'GCash' as const, icon: '📱', label: 'GCash' },
                    { method: 'Bank Transfer' as const, icon: '🏦', label: 'Bank Transfer' },
                    { method: 'Cash' as const, icon: '💵', label: 'Cash on Arrival' },
                  ]).map(m => (
                    <button key={m.method} onClick={() => setPaymentMethod(m.method)} style={{
                      padding: 14, borderRadius: 12,
                      border: `2px solid ${paymentMethod === m.method ? 'var(--polar)' : 'var(--mist)'}`,
                      background: paymentMethod === m.method ? 'var(--breeze)' : 'white', cursor: 'pointer',
                      fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
                      color: paymentMethod === m.method ? 'var(--polar)' : 'var(--ink)', transition: 'all 0.2s',
                    }}>
                      <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* GCash / Bank details */}
              {paymentMethod !== 'Cash' && (
                <div style={{ background: 'var(--cloud)', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid var(--border)' }}>
                  {paymentMethod === 'GCash' ? (
                    <>
                      <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--midnight)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>📱</span> GCash Payment Details
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { label: 'GCash Number', value: '0917-000-0000' },
                          { label: 'Account Name', value: 'ACT Aircon Services' },
                          { label: 'Amount', value: `₱${reservationFee.toLocaleString()}` },
                          { label: 'Reference', value: `ACT-${Date.now().toString().slice(-6)}` },
                        ].map(r => (
                          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                            <span style={{ color: 'var(--slate)' }}>{r.label}</span>
                            <strong style={{ fontFamily: r.label === 'Amount' || r.label === 'Reference' ? 'var(--font-mono)' : 'var(--font-body)', color: 'var(--ink)' }}>{r.value}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontWeight: 700, marginBottom: 12, color: 'var(--midnight)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span>🏦</span> Bank Transfer Details
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { label: 'Bank', value: 'BDO / BPI' },
                          { label: 'Account Number', value: '1234-5678-9012' },
                          { label: 'Account Name', value: 'ACT Aircon Services' },
                          { label: 'Amount', value: `₱${reservationFee.toLocaleString()}` },
                        ].map(r => (
                          <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                            <span style={{ color: 'var(--slate)' }}>{r.label}</span>
                            <strong style={{ fontFamily: r.label === 'Amount' || r.label === 'Account Number' ? 'var(--font-mono)' : 'var(--font-body)', color: 'var(--ink)' }}>{r.value}</strong>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
                    <Button
                      variant={screenshotUploaded ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => { setScreenshotUploaded(true); showToast('Screenshot uploaded! We\'ll verify it shortly.', 'success'); }}
                    >
                      {screenshotUploaded ? '✓ Screenshot Uploaded' : '📎 Upload Payment Screenshot'}
                    </Button>
                    {!screenshotUploaded && (
                      <p style={{ fontSize: 12, color: 'var(--slate)', marginTop: 8 }}>Upload your payment screenshot to confirm your booking.</p>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'Cash' && (
                <div style={{ background: 'var(--breeze)', borderRadius: 14, padding: 16, fontSize: 14, color: 'var(--slate)', border: '1px solid var(--mist)', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>💵</span>
                  <div>
                    Prepare <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>₱{reservationFee.toLocaleString()}</strong> cash.
                    Your technician will collect it on arrival before starting the service.
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
                {step === 3 ? 'Proceed to Payment →' : 'Continue →'}
              </Button>
            ) : (
              <Button
                variant="primary"
                loading={submitting}
                onClick={handleSubmit}
                disabled={paymentMethod !== 'Cash' && !screenshotUploaded}
              >
                {submitting ? 'Confirming…' : paymentMethod === 'Cash' ? '✓ Confirm Booking' : '✓ Submit & Confirm'}
              </Button>
            )}
          </div>

          {/* Disable hint on pay step */}
          {step === 4 && paymentMethod !== 'Cash' && !screenshotUploaded && (
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--slate)', marginTop: 12 }}>
              Upload your payment screenshot above to enable the confirm button.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
