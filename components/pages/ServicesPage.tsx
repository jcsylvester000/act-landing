'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store';
import { Button } from '@/components/ui';

const ServicesPage: React.FC = () => {
  const router = useRouter();
  const { currentUser } = useStore();

  const handleBook = () => {
    if (currentUser) router.push('/book');
    else router.push('/login');
  };

  const services = [
    {
      icon: '🧹',
      title: 'Basic Cleaning',
      subtitle: 'Standard AC maintenance',
      description: 'Our basic cleaning service covers coil brushing, filter cleaning, drain pan check, and basic refrigerant inspection. Ideal for regular upkeep every 3–4 months.',
      features: ['Filter & coil cleaning', 'Drain pan inspection', 'Airflow check', 'Basic performance report', 'Service certificate'],
      pricing: { split: 1500, window: 1200, cassette: 1800 },
      duration: '45–60 min',
      badge: 'Most Popular',
    },
    {
      icon: '💧',
      title: 'Deep Cleaning',
      subtitle: 'Chemical wash & full overhaul',
      description: 'A thorough chemical wash of all components including evaporator coil, blower wheel, and drain lines. Removes mold, bacteria, and built-up grime for peak efficiency.',
      features: ['Chemical coil wash', 'Blower wheel cleaning', 'Drain line flush', 'Refrigerant top-up check', 'Detailed efficiency report', 'Service certificate'],
      pricing: { split: 2500, window: 2000, cassette: 3000 },
      duration: '90–120 min',
      badge: 'Best Value',
    },
    {
      icon: '🔧',
      title: 'Repair & Diagnostics',
      subtitle: 'Troubleshooting & parts replacement',
      description: 'Full diagnostic assessment for units not cooling properly, making unusual noises, or leaking. Includes labor for minor repairs; parts billed separately.',
      features: ['Full diagnostic check', 'Error code reading', 'Minor repairs included', 'Parts sourcing assistance', 'Follow-up recommendation'],
      pricing: null,
      duration: 'Varies',
      badge: null,
    },
    {
      icon: '❄️',
      title: 'Refrigerant Recharge',
      subtitle: 'Freon / R410A top-up',
      description: 'Refrigerant leak detection and recharging service. We test for leaks first before adding refrigerant to ensure long-lasting results.',
      features: ['Leak detection test', 'Refrigerant recharge', 'Pressure test', 'Post-service check', 'Report & recommendation'],
      pricing: null,
      duration: '60–90 min',
      badge: null,
    },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center',
        color: 'white',
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
            ACT. Services
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 16px', lineHeight: 1.1 }}>
            Professional Aircon Services
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Government-accredited technicians. Transparent pricing. Service guarantee.
          </p>
          <Button variant="primary" size="lg" onClick={handleBook} style={{ background: 'var(--ember)', borderColor: 'var(--ember)' }}>
            Book a Service Now
          </Button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="services-body" style={{ maxWidth: 1100, margin: '0 auto', padding: '60px 24px' }}>
        <div className="services-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: 28 }}>
          {services.map(svc => (
            <div key={svc.title} style={{
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
              position: 'relative',
            }}>
              {svc.badge && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  background: svc.badge === 'Most Popular' ? 'var(--polar)' : 'var(--ember)',
                  color: 'white', fontSize: 11, fontWeight: 700,
                  padding: '4px 12px', borderRadius: 20, letterSpacing: 1,
                  textTransform: 'uppercase',
                }}>
                  {svc.badge}
                </div>
              )}
              <div style={{ padding: '32px 32px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{svc.icon}</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, margin: '0 0 4px', fontFamily: 'var(--font-display)' }}>{svc.title}</h3>
                <div style={{ color: 'var(--polar)', fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>{svc.subtitle}</div>
                <p style={{ color: 'var(--slate)', lineHeight: 1.7, marginBottom: 20 }}>{svc.description}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {svc.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 14 }}>
                      <span style={{ color: 'var(--polar)', fontSize: 16, flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div style={{
                borderTop: '1px solid var(--border)',
                padding: '20px 32px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'var(--snow)',
              }}>
                <div>
                  {svc.pricing ? (
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginBottom: 6 }}>Starting from</div>
                      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                        {[
                          { type: 'Split', price: svc.pricing.split },
                          { type: 'Window', price: svc.pricing.window },
                          { type: 'Cassette', price: svc.pricing.cassette },
                        ].map(p => (
                          <div key={p.type} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--polar)', fontFamily: 'var(--font-mono)' }}>₱{p.price.toLocaleString()}</div>
                            <div style={{ fontSize: 11, color: 'var(--slate)' }}>{p.type}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Price on Assessment</div>
                      <div style={{ fontSize: 12, color: 'var(--slate)' }}>Technician will quote on-site</div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <div style={{ fontSize: 12, color: 'var(--slate)' }}>⏱ {svc.duration}</div>
                  <Button variant="primary" size="sm" onClick={handleBook}>Book</Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Banner */}
        <div style={{
          marginTop: 60,
          background: 'linear-gradient(135deg, var(--midnight), var(--polar))',
          borderRadius: 20, padding: '40px 48px',
          color: 'white', textAlign: 'center',
        }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 12 }}>
            Backed by ACT Accreditation
          </h3>
          <p style={{ opacity: 0.85, marginBottom: 28, maxWidth: 500, margin: '0 auto 28px', lineHeight: 1.6 }}>
            All technicians are TESDA-certified and DICT-registered. Every job includes a digital service certificate.
          </p>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 32 }}>
            {['✓ TESDA Certified', '✓ Insured Technicians', '✓ Service Guarantee', '✓ Digital Reports'].map(t => (
              <span key={t} style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>{t}</span>
            ))}
          </div>
          <Button variant="secondary" size="lg" onClick={handleBook} style={{ borderColor: 'white', color: 'white' }}>
            Schedule Your Service
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
