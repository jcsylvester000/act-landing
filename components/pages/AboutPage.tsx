'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

const AboutPage: React.FC = () => {
  const router = useRouter();

  const team = [
    { name: 'Engr. Raphael Santos', role: 'Founder & Head Technician', bio: 'TESDA-certified HVAC engineer with 12 years in the industry. Founded ACT to bring professional-grade service to every household.', emoji: '👨‍🔧' },
    { name: 'Marie Dela Cruz', role: 'Operations Manager', bio: 'Manages technician scheduling, client relations, and quality assurance. Ensures every service meets ACT standards.', emoji: '👩‍💼' },
    { name: 'Kevin Reyes', role: 'Lead Technician', bio: 'Specialized in commercial and industrial HVAC systems. DICT-registered and handles complex diagnostics.', emoji: '🔧' },
    { name: 'Ana Villanueva', role: 'Client Success', bio: 'Your primary contact for service follow-ups, reminders, and satisfaction. Dedicated to making your experience seamless.', emoji: '📞' },
  ];

  const milestones = [
    { year: '2018', event: 'ACT Founded in Quezon City' },
    { year: '2019', event: 'DICT Accreditation Achieved' },
    { year: '2020', event: 'Expanded to 6 Metro Manila cities' },
    { year: '2021', event: '1,000 units serviced milestone' },
    { year: '2022', event: 'Launched digital service certificates' },
    { year: '2023', event: '5,000+ satisfied clients' },
    { year: '2024', event: 'Launched ACT online booking platform' },
    { year: '2025', event: '10,000+ units serviced' },
  ];

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center', color: 'white',
      }} className="about-hero">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>Our Story</div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 16px', lineHeight: 1.1 }}>
            About ACT.
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.6, maxWidth: 500, margin: '0 auto' }}>
            Accreditation, Commitment, Trust — the three pillars behind everything we do.
          </p>
        </div>
      </div>

      <div className="about-body" style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        {/* Mission */}
        <div className="about-mission-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 72, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--polar)', fontWeight: 700, marginBottom: 12 }}>Our Mission</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)', lineHeight: 1.2, marginBottom: 20 }}>
              Raising the standard of aircon care in the Philippines
            </h2>
            <p style={{ color: 'var(--slate)', lineHeight: 1.8, marginBottom: 16 }}>
              ACT was born from frustration with unreliable, uncertified technicians who leave homeowners with recurring problems and no accountability. We set out to change that.
            </p>
            <p style={{ color: 'var(--slate)', lineHeight: 1.8, marginBottom: 24 }}>
              Every ACT technician is TESDA-certified, DICT-registered, and follows a strict service protocol. We provide digital service reports, follow-up reminders, and a service guarantee on every job.
            </p>
            <Button variant="primary" onClick={() => router.push('/book')}>Book Your First Service</Button>
          </div>
          <div style={{
            background: 'linear-gradient(135deg, var(--breeze), var(--frost))',
            borderRadius: 24, padding: '40px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            {[
              { number: '10,000+', label: 'Units Serviced' },
              { number: '5,000+', label: 'Happy Clients' },
              { number: '6', label: 'Cities Covered' },
              { number: '4.9/5', label: 'Average Rating' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--polar)', fontFamily: 'var(--font-mono)', minWidth: 100 }}>{stat.number}</div>
                <div style={{ color: 'var(--midnight)', fontWeight: 600 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Values */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: 40 }}>Our Values</h2>
          <div className="about-values-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {[
              { icon: '🏅', title: 'Accreditation', desc: 'Every technician holds government-recognized certifications. We never cut corners on credentials.' },
              { icon: '🤝', title: 'Commitment', desc: 'We show up on time, complete the job right, and follow up. No ghosting, no excuses.' },
              { icon: '💙', title: 'Trust', desc: 'Transparent pricing, honest assessments, and digital proof of every service. Your trust is our currency.' },
            ].map(v => (
              <div key={v.title} style={{
                background: 'white', border: '1px solid var(--border)', borderRadius: 16,
                padding: 28, textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontSize: 40, marginBottom: 16 }}>{v.icon}</div>
                <h3 style={{ fontWeight: 800, marginBottom: 10, fontFamily: 'var(--font-display)' }}>{v.title}</h3>
                <p style={{ color: 'var(--slate)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div style={{ marginBottom: 72 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: 40 }}>Meet the Team</h2>
          <div className="about-team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {team.map(member => (
              <div key={member.name} style={{
                background: 'white', border: '1px solid var(--border)', borderRadius: 16,
                padding: 24, textAlign: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--breeze)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, margin: '0 auto 16px',
                }}>{member.emoji}</div>
                <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{member.name}</div>
                <div style={{ color: 'var(--polar)', fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>{member.role}</div>
                <p style={{ color: 'var(--slate)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: 40 }}>Our Journey</h2>
          <div style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: 40, top: 0, bottom: 0, width: 2, background: 'var(--border)' }} />
            {milestones.map((m, i) => (
              <div key={m.year} style={{
                display: 'flex', gap: 24, marginBottom: 24,
                opacity: i < milestones.length - 2 ? 0.8 : 1,
              }}>
                <div style={{
                  width: 80, height: 32, borderRadius: 8,
                  background: 'var(--polar)', color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 13, fontFamily: 'var(--font-mono)',
                  flexShrink: 0, zIndex: 1, position: 'relative',
                }}>{m.year}</div>
                <div style={{ paddingTop: 6, fontWeight: 600 }}>{m.event}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
