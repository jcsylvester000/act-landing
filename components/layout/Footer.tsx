'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

const Footer: React.FC = () => {
  const router = useRouter();
  const year = new Date().getFullYear();

  const cols = [
    {
      title: 'Services',
      links: [
        { label: 'Basic Cleaning', path: '/services' },
        { label: 'Deep Clean / Chemical Wash', path: '/services' },
        { label: 'Freon Recharge', path: '/services' },
        { label: 'Diagnostics', path: '/services' },
        { label: 'Installation', path: '/services' },
      ],
    },
    {
      title: 'Coverage',
      links: [
        { label: 'Biñan & San Pedro', path: '/coverage' },
        { label: 'Sta. Rosa & Cabuyao', path: '/coverage' },
        { label: 'Muntinlupa', path: '/coverage' },
        { label: 'Carmona & GMA Cavite', path: '/coverage' },
        { label: 'View Full Coverage', path: '/coverage' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About ACT', path: '/about' },
        { label: 'How It Works', path: '/#how-it-works' },
        { label: 'Accreditation', path: '/about' },
        { label: 'Contact Us', path: '/contact' },
        { label: 'Book a Service', path: '/book' },
      ],
    },
  ];

  return (
    <footer style={{ background: 'var(--midnight)', color: 'white', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden' }}>
      {/* Top gradient accent */}
      <div style={{ height: 3, background: 'linear-gradient(90deg, var(--polar), var(--frost), var(--ember), var(--frost), var(--polar))', backgroundSize: '200% 100%', animation: 'gradientShift 6s ease infinite' }} />

      {/* Subtle mesh */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 70% at 10% 50%, rgba(91,196,214,0.04), transparent), radial-gradient(ellipse 50% 60% at 90% 30%, rgba(10,110,143,0.06), transparent)', pointerEvents: 'none' }} />

      <div className="footer-main-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '64px 32px 0', position: 'relative', zIndex: 1 }}>
        {/* Main grid */}
        <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 56 }}>
          {/* Brand column */}
          <div className="footer-brand-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
                <img src="/logo-act.png" alt="ACT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, letterSpacing: '-0.5px' }}>
                  ACT<span style={{ color: 'var(--ember)' }}>.</span>
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Aircon Services</div>
              </div>
            </div>

            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, lineHeight: 1.8, marginBottom: 28, maxWidth: 300 }}>
              The reliability-first aircon service for South Metro Manila &amp; South Laguna. Accredited technicians, transparent pricing, and guaranteed quality — season after season.
            </p>

            {/* Contact points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {[
                { icon: '📱', label: '+63 9XX XXX XXXX', sub: 'WhatsApp / Viber' },
                { icon: '📧', label: 'hello@act.ph', sub: 'Email us anytime' },
                { icon: '⏰', label: 'Mon–Sat 8AM–6PM', sub: 'Service hours' },
              ].map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: 'rgba(91,196,214,0.1)', border: '1px solid rgba(91,196,214,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                  }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>{c.label}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social */}
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { label: 'FB', color: '#1877F2' },
                { label: 'IG', color: '#E4405F' },
                { label: 'WA', color: '#25D366' },
              ].map(s => (
                <button
                  key={s.label}
                  aria-label={`${s.label} — reach us via the Contact page`}
                  title="Reach us via the Contact page"
                  onClick={() => router.push('/contact')}
                  style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                    fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-body)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = s.color; e.currentTarget.style.borderColor = s.color; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.title}>
              <h4 style={{ fontSize: 12, fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
                {col.title}
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <button
                    key={link.label}
                    onClick={() => router.push(link.path)}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      textAlign: 'left', fontFamily: 'var(--font-body)',
                      fontSize: 14, color: 'rgba(255,255,255,0.55)',
                      transition: 'color 0.2s', lineHeight: 1.5,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--frost)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Accreditation bar */}
        <div className="footer-accred-bar" style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '28px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/accreditation-seal.png" alt="Accredited" style={{ width: 52, height: 52, opacity: 0.9 }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>ACT Accredited Aircon Service</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>TESDA Certified · Background-Verified · South Metro Manila &amp; Laguna</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {['GCash Accepted', 'Bank Transfer', 'Cash on Service'].map(p => (
              <div key={p} style={{
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
                color: 'rgba(255,255,255,0.45)', fontWeight: 500,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--frost)', display: 'inline-block' }} />
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
            © {year} ACT — Aircon Cleaning & Technician. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 20 }}>
            {['Privacy Policy', 'Terms of Service', 'Refund Policy'].map(t => (
              <button key={t} onClick={() => router.push(`/legal#${t.toLowerCase().replace(/ /g, '-')}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-body)', transition: 'color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              >{t}</button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
