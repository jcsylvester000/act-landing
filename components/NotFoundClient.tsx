'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function NotFoundClient() {
  const router = useRouter();

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--midnight)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', fontFamily: 'var(--font-body)', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 60% 70% at 20% 40%, rgba(91,196,214,0.06), transparent), radial-gradient(ellipse 50% 60% at 80% 70%, rgba(10,110,143,0.08), transparent)', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: '-1px', marginBottom: 32 }}>
          ACT<span style={{ color: 'var(--ember)' }}>.</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(80px, 20vw, 140px)', fontWeight: 800, lineHeight: 1, color: 'var(--polar)', letterSpacing: '-4px', marginBottom: 8, opacity: 0.9 }}>
          404
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(20px, 4vw, 28px)', fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-0.5px' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, lineHeight: 1.7, marginBottom: 40, maxWidth: 420, margin: '0 auto 40px' }}>
          Looks like this page went out for service and didn&apos;t come back. Let&apos;s get you somewhere cooler.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
          <button onClick={() => router.push('/')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, var(--ember), var(--ember-dark))', color: 'white', padding: '14px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 14px rgba(255,107,74,0.4)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
            ← Back to Home
          </button>
          <button onClick={() => router.push('/book')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', padding: '14px 28px', borderRadius: 12, border: '1.5px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
            Book a Service
          </button>
        </div>
        <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{ label: 'Services', path: '/services' }, { label: 'Coverage', path: '/coverage' }, { label: 'Contact', path: '/contact' }, { label: 'Dashboard', path: '/dashboard' }].map(link => (
            <button key={link.path} onClick={() => router.push(link.path)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--frost)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
