'use client';

import React from 'react';

const Section: React.FC<{ id: string; title: string; children: React.ReactNode }> = ({ id, title, children }) => (
  <section id={id} style={{ marginBottom: 56, scrollMarginTop: 90 }}>
    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>{title}</h2>
    <div style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--slate)' }}>{children}</div>
  </section>
);

const LegalPage: React.FC = () => {
  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)', padding: '72px 24px 52px', textAlign: 'center', color: 'white' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 14, fontFamily: 'var(--font-mono)' }}>Policies</div>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 44px)', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 12px', lineHeight: 1.1 }}>Legal &amp; Policies</h1>
          <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.7 }}>How ACT handles your data, your bookings, and your payments. Plain language, no fine-print surprises.</p>
        </div>
      </div>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '56px 24px 80px' }}>
        <Section id="privacy-policy" title="Privacy Policy">
          <p style={{ marginBottom: 14 }}>
            ACT (Aircon Cleaning &amp; Technician) collects only the information needed to schedule and deliver your aircon service: your name, contact number, service address, and the details of your booking. We use this information to coordinate your appointment, dispatch the right technician, send you service updates and maintenance reminders, and keep an accurate service history for your units.
          </p>
          <p style={{ marginBottom: 14 }}>
            We do not sell your personal information, and we share it only with the accredited technician assigned to your job, and only to the extent needed to perform the service. Payment references (such as GCash transaction numbers) are stored solely to reconcile your account. We comply with the Philippine Data Privacy Act of 2012 (RA 10173). You may request a copy of your data, ask for corrections, or request deletion at any time through our Contact page.
          </p>
        </Section>

        <Section id="terms-of-service" title="Terms of Service">
          <p style={{ marginBottom: 14 }}>
            ACT is an appointment-setting and service-coordination platform connecting clients in South Metro Manila and South Laguna with vetted, accredited aircon technicians. By booking through ACT, you agree to provide accurate address and unit details, and to make the service location reasonably accessible at the scheduled time.
          </p>
          <p style={{ marginBottom: 14 }}>
            Cleaning services are quoted at a fixed per-unit price, and the job total is always the per-unit price multiplied by the number of units. Installation, repair, and refrigerant services are quoted per job after assessment, and no work proceeds until you accept the quote. All payments are settled after the service is completed, via GCash, bank transfer, cash, or check for commercial accounts. Every service is covered by the ACT service guarantee: if a cleaning issue recurs within seven days, we return to make it right at no cost.
          </p>
        </Section>

        <Section id="refund-policy" title="Refund Policy">
          <p style={{ marginBottom: 14 }}>
            You may cancel or reschedule a booking at no charge any time before the technician is dispatched. If a reservation fee was collected for your booking, it is fully refundable for cancellations made at least 24 hours before the scheduled service window, and credited to a future booking for later cancellations.
          </p>
          <p style={{ marginBottom: 14 }}>
            If you are unsatisfied with a completed service, report it within seven days and we will schedule a free corrective visit. If the issue cannot be corrected, we will refund the affected portion of the service fee through your original payment method within five business days.
          </p>
        </Section>
      </div>
    </div>
  );
};

export default LegalPage;
