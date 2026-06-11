'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

const CoveragePage: React.FC = () => {
  const router = useRouter();

  // Actual ACT service area — South Metro Manila / South Laguna (per client Q&A)
  const cities = [
    {
      name: 'Biñan', emoji: '🏘️',
      highlight: 'Primary Hub',
      areas: ['Sto. Tomas', 'San Jose', 'Platero', 'Zapote', 'Dela Paz Norte', 'Langkiwa', 'Malaban', 'San Antonio'],
      techs: 2, avgResponse: '1–3 hrs',
    },
    {
      name: 'San Pedro', emoji: '🌆',
      highlight: 'Full Coverage',
      areas: ['Poblacion', 'San Antonio', 'Calendola', 'Cuyab', 'Landayan', 'Lanuza', 'Magsaysay', 'Nueva'],
      techs: 2, avgResponse: '2–4 hrs',
    },
    {
      name: 'Sta. Rosa', emoji: '🏢',
      highlight: 'Commercial Zone',
      areas: ['Nuvali', 'Balibago', 'Tagapo', 'Kanluran', 'Macabling', 'Don Jose', 'Market Area', 'Pulong Sta. Cruz'],
      techs: 2, avgResponse: '2–4 hrs',
    },
    {
      name: 'Cabuyao', emoji: '🏭',
      highlight: 'Industrial & Residential',
      areas: ['Banay-Banay', 'Barandal', 'Bigaa', 'Pulo', 'Marinig', 'Laguerta', 'Sala', 'San Sebastian'],
      techs: 1, avgResponse: '3–5 hrs',
    },
    {
      name: 'Muntinlupa', emoji: '🌉',
      highlight: 'South Metro',
      areas: ['Alabang', 'Ayala Alabang', 'Sucat', 'Putatan', 'Buli', 'Cupang', 'Bayanan', 'Tunasan'],
      techs: 2, avgResponse: '2–4 hrs',
    },
    {
      name: 'Carmona', emoji: '🌿',
      highlight: 'Cavite Gateway',
      areas: ['Lantic', 'Mabuhay', 'Maduya', 'Milagrosa', 'Poblacion', 'San Roque', 'Cabilang Baybay'],
      techs: 1, avgResponse: '3–5 hrs',
    },
    {
      name: 'GMA Cavite', emoji: '🏡',
      highlight: 'Gen. Mariano Alvarez',
      areas: ['Buenavista I-IV', 'Lapidario', 'Poblacion I-IV', 'Sampalucan', 'San Gabriel', 'San Jose', 'Sahud Ulan'],
      techs: 1, avgResponse: '3–5 hrs',
    },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center', color: 'white',
      }} className="coverage-hero">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>Service Areas</div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 16px', lineHeight: 1.1 }}>
            South Metro Manila<br />& South Laguna
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.6, maxWidth: 500, margin: '0 auto 32px' }}>
            7 cities, 3 on-call technicians. Biñan · San Pedro · Sta. Rosa · Cabuyao · Muntinlupa · Carmona · GMA
          </p>
          <Button variant="primary" size="lg" onClick={() => router.push('/book')} style={{ background: 'var(--ember)', borderColor: 'var(--ember)' }}>
            Book in My Area
          </Button>
        </div>
      </div>

      <div className="coverage-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        {/* Stats */}
        <div className="coverage-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 60,
        }}>
          {[
            { number: '7', label: 'Cities Covered' },
            { number: '3', label: 'On-Call Technicians' },
            { number: '20+', label: 'Regular Clients' },
            { number: '1–5 hrs', label: 'Avg Response Time' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', border: '1px solid var(--border)', borderRadius: 16,
              padding: '24px 20px', textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--polar)', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{s.number}</div>
              <div style={{ fontSize: 13, color: 'var(--slate)', fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Cities Grid */}
        <div className="coverage-cities-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {cities.map(city => (
            <div key={city.name} style={{
              background: 'white', border: '1px solid var(--border)', borderRadius: 20,
              overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--midnight), var(--polar))',
                padding: '24px 28px', color: 'white',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{city.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18, fontFamily: 'var(--font-display)' }}>{city.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1 }}>{city.highlight}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 12, opacity: 0.85 }}>
                    <div style={{ fontWeight: 700 }}>{city.techs} technician{city.techs > 1 ? 's' : ''}</div>
                    <div>{city.avgResponse}</div>
                  </div>
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 12, color: 'var(--polar)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Coverage Areas</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                  {city.areas.map(area => (
                    <span key={area} style={{
                      background: 'var(--breeze)', color: 'var(--midnight)',
                      fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 20,
                    }}>{area}</span>
                  ))}
                </div>
                <Button variant="primary" style={{ width: '100%' }} onClick={() => router.push('/book')}>
                  Book in {city.name}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Not in area? */}
        <div style={{
          marginTop: 60,
          background: 'var(--snow)',
          border: '1px solid var(--border)',
          borderRadius: 20, padding: '40px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>📍</div>
          <h3 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 12 }}>
            Not seeing your area?
          </h3>
          <p style={{ color: 'var(--slate)', marginBottom: 24, maxWidth: 500, margin: '0 auto 24px', lineHeight: 1.6 }}>
            We&apos;re expanding! Send us a message or contact us — we may be able to accommodate you, or add your area to our next expansion.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="primary" onClick={() => router.push('/contact')}>
              💬 Contact Us
            </Button>
            <Button variant="secondary" onClick={() => router.push('/book')}>
              Book a Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoveragePage;
