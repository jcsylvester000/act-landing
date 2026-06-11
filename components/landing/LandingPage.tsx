'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, SectionHeader } from '@/components/ui';

// ─── SCROLL REVEAL HOOK ────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add('visible'); obs.unobserve(el); }
    }, { threshold: 0.12 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── ANIMATED CANVAS HERO ─────────────────────────────────────────────────────
const HeroCanvas: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    type Particle = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; life: number; maxLife: number };
    const particles: Particle[] = [];
    const addParticle = () => {
      particles.push({ x: Math.random() * canvas.width, y: canvas.height + 5, vx: (Math.random() - 0.5) * 0.8, vy: -(Math.random() * 0.6 + 0.3), size: Math.random() * 2.5 + 0.5, opacity: Math.random() * 0.6 + 0.2, life: 0, maxLife: Math.random() * 200 + 100 });
    };
    for (let i = 0; i < 80; i++) { addParticle(); particles[i].y = Math.random() * canvas.height; particles[i].life = Math.random() * particles[i].maxLife; }

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.4) addParticle();
      while (particles.length > 120) particles.shift();

      const orbs = [
        { x: canvas.width * 0.2, y: canvas.height * 0.3, r: 300, c1: 'rgba(91,196,214,0.06)', c2: 'transparent' },
        { x: canvas.width * 0.8, y: canvas.height * 0.6, r: 250, c1: 'rgba(10,110,143,0.08)', c2: 'transparent' },
      ];
      orbs.forEach(o => {
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, o.c1); g.addColorStop(1, o.c2);
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
      });

      const waves = [
        { yFactor: 0.75, amp: 35, freq: 0.003, speed: 0.15, color: 'rgba(91,196,214,0.07)' },
        { yFactor: 0.82, amp: 24, freq: 0.004, speed: 0.22, color: 'rgba(10,110,143,0.05)' },
      ];
      waves.forEach(w => {
        ctx.beginPath(); ctx.moveTo(-10, canvas.height * w.yFactor);
        for (let x = 0; x <= canvas.width + 10; x += 3) {
          const y = canvas.height * w.yFactor + Math.sin(x * w.freq + t * w.speed) * w.amp + Math.cos(x * w.freq * 0.7 + t * w.speed * 1.3) * (w.amp * 0.4);
          ctx.lineTo(x, y);
        }
        ctx.lineTo(canvas.width + 10, canvas.height); ctx.lineTo(-10, canvas.height); ctx.closePath();
        ctx.fillStyle = w.color; ctx.fill();
      });

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(t * 0.02 + i) * 0.3; p.y += p.vy; p.life++;
        const fade = p.life > p.maxLife * 0.7 ? 1 - (p.life - p.maxLife * 0.7) / (p.maxLife * 0.3) : 1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(91,196,214,${p.opacity * fade})`; ctx.fill();
        if (p.life >= p.maxLife || p.y < -10) particles.splice(i, 1);
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
      t += 1; animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
};

// ─── FLOATING PRICE CARD ──────────────────────────────────────────────────────
const PriceCard: React.FC = () => {
  const router = useRouter();
  const [hovered, setHovered] = useState<number | null>(null);
  const rows = [
    { service: 'Basic Clean', type: 'Split Type', price: '₱1,500', freq: 'Quarterly' },
    { service: 'Deep Clean', type: 'Split Type', price: '₱2,500', freq: 'Bi-annual' },
    { service: 'Deep Clean', type: 'Cassette', price: '₱3,000', freq: 'Bi-annual' },
    { service: 'Freon Recharge', type: 'All types', price: '₱3,000+', freq: 'As needed' },
  ];
  return (
    <div className="anim-fade-up d-400 hero-price-card" style={{
      background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      border: '1px solid rgba(255,255,255,0.12)', borderRadius: 24, padding: 28,
      boxShadow: '0 32px 80px rgba(6,42,61,0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <img src="/logo-act.png" alt="ACT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.3px' }}>
            ACT<span style={{ color: 'var(--ember)' }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.5px' }}>Transparent Pricing</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', background: 'rgba(27,168,126,0.2)', color: '#6ee7c4', border: '1px solid rgba(27,168,126,0.3)', borderRadius: 99, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Live Rates</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginBottom: 18 }}>
        {rows.map((r, i) => (
          <div key={i} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 10, background: hovered === i ? 'rgba(255,255,255,0.08)' : 'transparent', transition: 'background 0.2s', cursor: 'default' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{r.service}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{r.type} · {r.freq}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700, color: 'var(--frost)' }}>{r.price}</div>
          </div>
        ))}
      </div>
      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 18 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,74,0.1)', border: '1px solid rgba(255,107,74,0.2)', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
        <span style={{ fontSize: 16 }}>🔐</span>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>
          <strong style={{ color: 'var(--ember)', fontWeight: 700 }}>₱300–₱500</strong> reservation fee locks your slot. Balance paid after service.
        </div>
      </div>
      <Button variant="primary" fullWidth onClick={() => router.push('/book')} style={{ fontSize: 14, fontWeight: 800 }}>Book in Minutes →</Button>
    </div>
  );
};

// ─── STAT COUNTER ─────────────────────────────────────────────────────────────
const StatCounter: React.FC<{ value: string; label: string; sub: string; delay: number }> = ({ value, label, sub, delay }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.unobserve(el); } }, { threshold: 0.4 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ textAlign: 'center', opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity 0.6s ease ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms` }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, color: 'var(--polar)', lineHeight: 1, letterSpacing: '-1px' }}>{value}</div>
      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--midnight)', marginTop: 10 }}>{label}</div>
      <div style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>{sub}</div>
    </div>
  );
};

// ─── SERVICE CARD ─────────────────────────────────────────────────────────────
const ServiceCard: React.FC<{ icon: string; title: string; desc: string; prices: { type: string; price: number }[]; fee: number; badge?: string; delay: number }> = ({ icon, title, desc, prices, fee, badge, delay }) => {
  const router = useRouter();
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ background: 'var(--white)', borderRadius: 22, border: '1px solid var(--border)', overflow: 'hidden', height: '100%', position: 'relative', boxShadow: 'var(--shadow-sm)', transition: 'transform 0.3s var(--ease-out), box-shadow 0.3s var(--ease-out), border-color 0.3s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(10,110,143,0.2)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
        {badge && <div style={{ position: 'absolute', top: 16, right: 16, background: badge === 'Most Popular' ? 'var(--polar)' : 'var(--ember)', color: 'white', fontSize: 11, fontWeight: 800, padding: '4px 11px', borderRadius: 99, letterSpacing: '0.5px', textTransform: 'uppercase', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>{badge}</div>}
        <div style={{ height: 4, background: 'linear-gradient(90deg, var(--polar), var(--frost))' }} />
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: 'linear-gradient(135deg, var(--breeze), rgba(91,196,214,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, marginBottom: 16, border: '1px solid rgba(91,196,214,0.3)' }}>{icon}</div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--midnight)', marginBottom: 10, lineHeight: 1.2 }}>{title}</h3>
          <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.7, marginBottom: 20 }}>{desc}</p>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, marginBottom: 20 }}>
            {prices.map(p => (
              <div key={p.type} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '6px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--frost)', display: 'inline-block' }} />
                  <span style={{ fontSize: 13, color: 'var(--slate)' }}>{p.type}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--polar)' }}>₱{p.price.toLocaleString()}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--slate)' }}>/unit</span></span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: '16px 24px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, transparent, var(--snow))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,107,74,0.08)', border: '1px solid rgba(255,107,74,0.15)', borderRadius: 99, padding: '4px 12px' }}>
            <span style={{ fontSize: 11 }}>🔒</span>
            <span style={{ fontSize: 12, color: 'var(--ember-dark)', fontWeight: 700 }}>₱{fee} to reserve</span>
          </div>
          <Button variant="primary" size="sm" onClick={() => router.push('/book')}>Book →</Button>
        </div>
      </div>
    </div>
  );
};

// ─── HOW STEP ─────────────────────────────────────────────────────────────────
const HowStep: React.FC<{ num: number; icon: string; title: string; desc: string; delay: number }> = ({ num, icon, title, desc, delay }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={{ animationDelay: `${delay}ms`, textAlign: 'center', padding: '0 12px' }}>
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 24 }}>
        <div style={{ width: 88, height: 88, borderRadius: 24, background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto', boxShadow: '0 12px 32px rgba(10,110,143,0.3)', position: 'relative', overflow: 'hidden' }}>
          <span style={{ position: 'relative', zIndex: 1 }}>{icon}</span>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,255,255,0.08), transparent)' }} />
        </div>
        <div style={{ position: 'absolute', top: -8, right: -8, width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, var(--ember), var(--ember-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, boxShadow: '0 4px 10px rgba(255,107,74,0.4), 0 0 0 3px white' }}>{num}</div>
      </div>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--midnight)', marginBottom: 10, lineHeight: 1.2 }}>{title}</h3>
      <p style={{ fontSize: 14, color: 'var(--slate)', lineHeight: 1.75, maxWidth: 250, margin: '0 auto' }}>{desc}</p>
    </div>
  );
};

// ─── TESTIMONIAL ─────────────────────────────────────────────────────────────
const Testimonial: React.FC<{ name: string; city: string; rating: number; text: string; delay: number }> = ({ name, city, rating, text, delay }) => {
  const ref = useReveal();
  return (
    <div ref={ref} className="reveal" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--border)', padding: 26, height: '100%', boxShadow: 'var(--shadow-xs)', transition: 'transform 0.3s var(--ease-out), box-shadow 0.3s' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; }}>
        <div style={{ display: 'flex', gap: 3, marginBottom: 14 }}>
          {Array.from({ length: 5 }, (_, i) => <span key={i} style={{ fontSize: 14, color: i < rating ? '#F5A623' : 'var(--mist)' }}>★</span>)}
          <span style={{ fontSize: 11, color: 'var(--slate)', marginLeft: 4, alignSelf: 'center' }}>Verified</span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.75, marginBottom: 18, fontStyle: 'italic' }}>&ldquo;{text}&rdquo;</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, var(--polar), var(--frost))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15, boxShadow: '0 3px 10px rgba(10,110,143,0.25)', flexShrink: 0 }}>{name[0]}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{name}</div>
            <div style={{ fontSize: 12, color: 'var(--slate)' }}>📍 {city}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── COMPARISON ROW ────────────────────────────────────────────────────────────
const CompRow: React.FC<{ label: string; act: boolean; informal: boolean; apps: boolean }> = ({ label, act, informal, apps }) => (
  <div className="comparison-row" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', padding: '12px 20px', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.15s' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
    <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{label}</span>
    {[act, informal, apps].map((v, i) => (
      <div key={i} className="comparison-cell" style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: v ? 'rgba(27,168,126,0.15)' : 'rgba(229,72,77,0.12)', fontSize: 11, fontWeight: 800, color: v ? '#6ee7c4' : '#fca5a5', border: `1px solid ${v ? 'rgba(27,168,126,0.3)' : 'rgba(229,72,77,0.25)'}` }}>
          {v ? '✓' : '✕'}
        </span>
      </div>
    ))}
  </div>
);

// ─── CITY CHIP ────────────────────────────────────────────────────────────────
const CityChip: React.FC<{ name: string; delay: number }> = ({ name, delay }) => {
  const [hov, setHov] = useState(false);
  return (
    <div className="city-chip anim-fade-up" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ animationDelay: `${delay}ms`, display: 'flex', alignItems: 'center', gap: 10, background: hov ? 'var(--polar)' : 'var(--white)', border: `2px solid ${hov ? 'var(--polar)' : 'var(--border)'}`, borderRadius: 14, padding: '14px 22px', fontWeight: 700, fontSize: 15, color: hov ? 'white' : 'var(--ink)', cursor: 'pointer', transition: 'all 0.25s var(--ease-out)', transform: hov ? 'translateY(-3px)' : 'none', boxShadow: hov ? 'var(--shadow-polar)' : 'var(--shadow-xs)' }}>
      <span style={{ fontSize: 18 }}>📍</span>{name}
    </div>
  );
};

// ─── MOBILE STICKY CTA ────────────────────────────────────────────────────────
const MobileStickyBar: React.FC = () => {
  const router = useRouter();
  return (
    <div className="mobile-sticky-cta safe-bottom">
      <div style={{ flex: 1, fontSize: 13, color: 'var(--slate)' }}>
        <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--polar)', fontWeight: 700 }}>₱1,200</span> · Basic clean from
      </div>
      <Button variant="primary" size="sm" onClick={() => router.push('/book')} style={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
        Book Now →
      </Button>
    </div>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage: React.FC = () => {
  const router = useRouter();

  return (
    <div style={{ background: 'var(--cloud)', fontFamily: 'var(--font-body)' }}>

      {/* ═══ HERO ══════════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', background: 'linear-gradient(160deg, var(--midnight) 0%, #0d4a66 45%, #0d6080 75%, var(--polar) 100%)' }}>
        <HeroCanvas />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 60% 60% at 30% 40%, rgba(91,196,214,0.08) 0%, transparent 70%)' }} />

        <div className="hero-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 32px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) min(420px, 42vw)', gap: 60, alignItems: 'center', width: '100%', position: 'relative', zIndex: 1 }}>
          {/* Left */}
          <div>
            <div className="anim-fade-up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(91,196,214,0.1)', border: '1px solid rgba(91,196,214,0.25)', borderRadius: 99, padding: '7px 16px 7px 10px', marginBottom: 28, animation: 'borderGlow 3s ease-in-out infinite' }}>
              <img src="/accreditation-seal.png" alt="" style={{ width: 22, height: 22 }} />
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--frost)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>ACT Accredited Service</span>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--verified)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            </div>

            <h1 className="anim-fade-up d-100" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, letterSpacing: '-2px' }}>
              <span style={{ color: 'white' }}>South Manila&apos;s</span><br />
              <span className="gradient-text-hero">Vetted Aircon</span><br />
              <span style={{ color: 'white' }}>Service</span><span style={{ color: 'var(--ember)' }}>.</span>
            </h1>
            <p className="anim-fade-up d-200" style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: 36, maxWidth: 460 }}>
              On-time. Certified. Transparent pricing. A single point of accountability — no anonymous technicians, no guesswork.
            </p>
            <div className="hero-cta-row anim-fade-up d-300" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 44 }}>
              <Button variant="primary" size="lg" onClick={() => router.push('/book')} style={{ fontWeight: 800, letterSpacing: '-0.3px', fontSize: 16 }}>Book Your Clean →</Button>
              <button onClick={() => router.push('/services')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '15px 24px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.85)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                See Pricing
              </button>
            </div>
            <div className="hero-stat-row anim-fade-up d-400" style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
              {[{ v: '4.8★', l: 'Client Rating', icon: '⭐' }, { v: '500+', l: 'Jobs Done', icon: '✅' }, { v: '6', l: 'Cities', icon: '📍' }].map(s => (
                <div key={s.l} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 20 }}>{s.icon}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1, letterSpacing: '-0.5px' }}>{s.v}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Price card */}
          <PriceCard />
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: 36, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, animation: 'fadeIn 1s ease 1.5s both' }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase' }}>Scroll</span>
          <div className="anim-float" style={{ width: 28, height: 44, border: '1.5px solid rgba(255,255,255,0.25)', borderRadius: 99, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 6 }}>
            <div style={{ width: 4, height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.5)', animation: 'float 1.8s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* ═══ TRUST BAR ═══ */}
      <section style={{ background: 'var(--white)', borderBottom: '1px solid var(--border)', boxShadow: '0 1px 0 var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px' }}>
          <div className="trust-bar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[
              { icon: '🏅', label: 'ACT Accredited', sub: 'TESDA-certified, background-verified' },
              { icon: '₱', label: 'Fixed Transparent Pricing', sub: 'Every peso declared upfront' },
              { icon: '📍', label: '7 Cities Covered', sub: 'South Metro Manila & South Laguna' },
              { icon: '🛡️', label: 'Service Guarantee', sub: 'We fix it or return — free' },
            ].map((item, i) => (
              <div key={i} className="trust-bar-item" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 28px', borderRight: i < 3 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--snow)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: 'linear-gradient(135deg, var(--breeze), rgba(91,196,214,0.2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: i === 1 ? 20 : 22, color: i === 1 ? 'var(--polar)' : undefined, fontFamily: i === 1 ? 'var(--font-mono)' : undefined, fontWeight: i === 1 ? 800 : undefined, border: '1px solid rgba(91,196,214,0.3)' }}>{item.icon}</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--midnight)', lineHeight: 1.2 }}>{item.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 3 }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SERVICES ════ */}
      <section style={{ padding: '100px 32px', background: 'var(--cloud)' }} className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader className="section-header-mb" eyebrow="Our Services" title="Transparent Pricing, Every Time" subtitle="No surprises. Every peso is declared before a technician is dispatched. Price is per unit, calculated at booking." />
          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <ServiceCard title="Basic Cleaning" icon="🧹" delay={0} badge="Most Popular" desc="Thorough clean of filters, coils, and drainage. Prevents mold and keeps your unit running at full efficiency." prices={[{ type: 'Split Type', price: 1500 }, { type: 'Window Type', price: 1200 }, { type: 'Cassette Type', price: 1800 }]} fee={300} />
            <ServiceCard title="Deep Clean / Chemical Wash" icon="💧" delay={100} desc="Complete chemical wash and disinfection. Removes stubborn buildup, bacteria, and restores full cooling performance." prices={[{ type: 'Split Type', price: 2500 }, { type: 'Window Type', price: 2000 }, { type: 'Cassette Type', price: 3000 }]} fee={500} />
            <ServiceCard title="Additional Services" icon="🔧" delay={200} desc="Freon recharge, diagnostics, fan motor replacement, compressor service, and new unit installation." prices={[{ type: 'Freon Recharge', price: 3000 }, { type: 'Diagnostics', price: 800 }, { type: 'Installation', price: 5000 }]} fee={500} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Button variant="secondary" size="lg" onClick={() => router.push('/services')} icon={<span>📋</span>}>View Full Service Catalog</Button>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ════ */}
      <section id="how-it-works" style={{ padding: '100px 32px', background: 'var(--white)', position: 'relative', overflow: 'hidden' }} className="section-pad">
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(91,196,214,0.05), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <SectionHeader className="section-header-mb" eyebrow="Simple Process" title="Book in 3 Steps" subtitle="From decision to done — the fastest route to a cool, clean home or office." />
          <div style={{ position: 'relative' }}>
            <div className="how-connector-line hide-mobile" style={{ position: 'absolute', top: 44, left: 'calc(16.66% + 44px)', right: 'calc(16.66% + 44px)', height: 2, background: 'linear-gradient(90deg, var(--polar), var(--frost), var(--polar))', backgroundSize: '200% 100%', animation: 'gradientShift 3s ease infinite', zIndex: 0 }} />
            <div className="how-steps-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, position: 'relative', zIndex: 1 }}>
              <HowStep num={1} icon="📋" title="Pick Your Service" desc="Choose cleaning type, AC type, and units. Get an instant locked-in price." delay={0} />
              <HowStep num={2} icon="💳" title="Pay ₱300–500 to Reserve" desc="A small reservation fee confirms your slot and technician. No surprises." delay={150} />
              <HowStep num={3} icon="🧑‍🔧" title="Technician Arrives On Time" desc="Accredited tech shows up, completes the job, and you settle the balance." delay={300} />
            </div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 56 }}>
            <Button variant="primary" size="lg" onClick={() => router.push('/book')} style={{ fontWeight: 800, fontSize: 16 }}>Start Booking Now →</Button>
            <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 12 }}>Takes less than 3 minutes · No account needed to browse</p>
          </div>
        </div>
      </section>

      {/* ═══ WHY ACT COMPARISON ════ */}
      <section style={{ padding: '100px 32px', background: 'var(--midnight)', position: 'relative', overflow: 'hidden' }} className="section-pad">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(91,196,214,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(10,110,143,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
          <SectionHeader className="section-header-mb" eyebrow="The ACT Difference" title="Why Choose ACT?" subtitle="We don't compete on price — we compete on reliability, accountability, and trust." dark center />
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(12px)' }}>
            <div className="comparison-header" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', padding: '14px 20px', background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Feature</span>
              {[{ label: 'ACT.', color: 'var(--frost)' }, { label: 'Informal', color: 'rgba(255,255,255,0.4)' }, { label: 'App', color: 'rgba(255,255,255,0.4)' }].map(col => (
                <div key={col.label} className="comparison-col-label" style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: col.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{col.label}</div>
              ))}
            </div>
            <CompRow label="Background-verified technicians" act={true} informal={false} apps={false} />
            <CompRow label="Fixed, transparent pricing" act={true} informal={false} apps={false} />
            <CompRow label="Service history & digital records" act={true} informal={false} apps={false} />
            <CompRow label="Automated follow-up reminders" act={true} informal={false} apps={false} />
            <CompRow label="Single accountability point" act={true} informal={false} apps={false} />
            <CompRow label="Service guarantee & SLA" act={true} informal={false} apps={false} />
            <CompRow label="Quality accreditation" act={true} informal={false} apps={false} />
            <CompRow label="Competitive metro pricing" act={true} informal={true} apps={true} />
          </div>
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Button variant="primary" size="lg" onClick={() => router.push('/book')}>Experience the ACT Difference →</Button>
          </div>
        </div>
      </section>

      {/* ═══ STATS ════ */}
      <section style={{ padding: '100px 32px', background: 'var(--breeze)', position: 'relative', overflow: 'hidden' }} className="section-pad">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 50% 80% at 10% 50%, rgba(10,110,143,0.08), transparent), radial-gradient(ellipse 40% 60% at 90% 50%, rgba(91,196,214,0.1), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative' }}>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 40 }}>
            <StatCounter value="4.9★" label="Client Rating" sub="Based on 300+ verified reviews" delay={0} />
            <StatCounter value="500+" label="Jobs Done" sub="Growing every week" delay={100} />
            <StatCounter value="7" label="Cities Covered" sub="South Metro Manila & Laguna" delay={200} />
            <StatCounter value="100%" label="Accredited" sub="Every technician certified" delay={300} />
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ════ */}
      <section style={{ padding: '100px 32px', background: 'var(--cloud)' }} className="section-pad">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <SectionHeader className="section-header-mb" eyebrow="Client Reviews" title="What Our Clients Say" subtitle="Real feedback from real clients — no manufactured reviews." />
          <div className="testimonials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            <Testimonial delay={0} rating={5} name="Ana V." city="Biñan" text="Mark arrived exactly on time, cleaned all three units perfectly. The whole experience was smoother than I expected. Booking again next quarter." />
            <Testimonial delay={80} rating={5} name="Bong M." city="Muntinlupa" text="Finally a service where I know the exact price before anyone shows up. No haggling. The deep clean genuinely made a difference." />
            <Testimonial delay={160} rating={5} name="Cris L." city="Sta. Rosa" text="Used them for our office — four cassettes. Handled professionally, finished on schedule, and the price was competitive." />
            <Testimonial delay={240} rating={4} name="Diana T." city="San Pedro" text="On time, polite technician, thorough job. The digital service record and reminder system is genuinely useful. Will rebook." />
          </div>
        </div>
      </section>

      {/* ═══ COVERAGE ════ */}
      <section style={{ padding: '100px 32px', background: 'var(--white)' }} className="section-pad">
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <SectionHeader className="section-header-mb" eyebrow="Service Areas" title="Covering South Metro Manila & South Laguna" subtitle="From Muntinlupa to Cabuyao — same-day and next-day availability across 7 cities." />
          <div className="city-chips-wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginBottom: 40 }}>
            {['Biñan', 'San Pedro', 'Sta. Rosa', 'Cabuyao', 'Muntinlupa', 'Carmona', 'GMA Cavite'].map((city, i) => (
              <CityChip key={city} name={city} delay={i * 60} />
            ))}
          </div>
          <p style={{ textAlign: 'center', color: 'var(--slate)', fontSize: 14 }}>
            Not in the list?{' '}
            <button onClick={() => router.push('/coverage')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--polar)', fontWeight: 700, fontFamily: 'var(--font-body)', textDecoration: 'underline', textUnderlineOffset: 3 }}>
              View expansion waitlist →
            </button>
          </p>
        </div>
      </section>

      {/* ═══ CTA BANNER ════ */}
      <section style={{ padding: '100px 32px 140px', background: 'var(--midnight)', position: 'relative', overflow: 'hidden' }} className="section-pad">
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 80% at 20% 50%, rgba(10,110,143,0.25), transparent), radial-gradient(ellipse 50% 70% at 80% 50%, rgba(91,196,214,0.15), transparent)', pointerEvents: 'none', animation: 'gradientShift 8s ease infinite' }} />
        <div style={{ maxWidth: 680, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div className="anim-fade-up" style={{ marginBottom: 28 }}>
            <img src="/accreditation-seal.png" alt="Accredited" style={{ width: 80, height: 80, filter: 'drop-shadow(0 4px 16px rgba(91,196,214,0.4))' }} />
          </div>
          <h2 className="anim-fade-up d-100" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: 'white', marginBottom: 18, lineHeight: 1.1, letterSpacing: '-1px' }}>
            Ready for a Cooler,<br />Cleaner Home?
          </h2>
          <p className="anim-fade-up d-200" style={{ color: 'rgba(255,255,255,0.65)', fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
            Book your accredited aircon service today. ₱300 reserves your slot — balance after service. No surprises.
          </p>
          <div className="cta-buttons-row anim-fade-up d-300" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" size="lg" onClick={() => router.push('/book')} style={{ fontWeight: 800, fontSize: 16 }}>Book Your Service →</Button>
            <a href="https://wa.me/639170000000" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#25D366', color: 'white', padding: '15px 28px', borderRadius: 12, textDecoration: 'none', fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-body)', transition: 'all 0.2s', boxShadow: '0 4px 14px rgba(37,211,102,0.4)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              💬 Chat on WhatsApp
            </a>
          </div>
          <p className="anim-fade-up d-400" style={{ marginTop: 24, fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
            Response within 1 hour · Mon–Sat 8AM–6PM
          </p>
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <MobileStickyBar />
    </div>
  );
};

export default LandingPage;
