'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input, Textarea, Toast } from '@/components/ui';

const ContactPage: React.FC = () => {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setSubmitted(true);
    showToast("Message sent! We'll get back to you within 24 hours.", 'success');
  };

  return (
    <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ink)' }}>
      <Toast {...toast} />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, var(--polar) 100%)',
        padding: '80px 24px 60px',
        textAlign: 'center', color: 'white',
      }} className="contact-hero">
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div style={{ fontSize: 13, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.7, marginBottom: 16, fontFamily: 'var(--font-mono)' }}>Get In Touch</div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, fontFamily: 'var(--font-display)', margin: '0 0 16px', lineHeight: 1.1 }}>
            Contact ACT.
          </h1>
          <p style={{ fontSize: 18, opacity: 0.85, lineHeight: 1.6 }}>
            Questions, quotes, or feedback — we respond within 24 hours.
          </p>
        </div>
      </div>

      <div className="contact-body" style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 24px' }}>
        <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 48, alignItems: 'start' }}>
          {/* Contact Info */}
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 32 }}>Contact Info</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, marginBottom: 40 }}>
              {[
                { icon: '📱', label: 'Call / Text', value: '+63 9XX XXX XXXX', sub: 'Mon–Sat, 8AM–6PM' },
                { icon: '📧', label: 'Email', value: 'hello@act.ph', sub: 'Responses within 24 hours' },
                { icon: '📍', label: 'Office', value: 'Biñan, Laguna', sub: 'By appointment only' },
                { icon: '⏰', label: 'Service Hours', value: 'Monday – Saturday', sub: '8:00 AM – 6:00 PM' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'var(--breeze)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, flexShrink: 0,
                  }}>{item.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 }}>{item.label}</div>
                    <div style={{ fontWeight: 700, marginBottom: 2 }}>{item.value}</div>
                    <div style={{ fontSize: 12, color: 'var(--slate)' }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div style={{ background: 'var(--snow)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16, fontFamily: 'var(--font-display)' }}>Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Button variant="primary" onClick={() => router.push('/dashboard#chat-history')}>
                  💬 View Chat History
                </Button>
                <Button variant="secondary" onClick={() => router.push('/book')}>
                  📅 Book a Service
                </Button>
                <Button variant="ghost" onClick={() => router.push('/services')}>
                  🔍 View Services & Pricing
                </Button>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 20, padding: 36, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>✅</div>
                <h3 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 12 }}>Message Received!</h3>
                <p style={{ color: 'var(--slate)', lineHeight: 1.6, marginBottom: 28 }}>
                  Thank you for reaching out. Our team will get back to you within 24 hours. For faster response, message us in-app from your dashboard.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <Button variant="primary" onClick={() => setSubmitted(false)}>Send Another</Button>
                  <Button variant="secondary" onClick={() => router.push('/')}>Go Home</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h2 style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: 24 }}>Send a Message</h2>
                <div className="contact-form-fields-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Input
                    label="Full Name *"
                    placeholder="Juan dela Cruz"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  <Input
                    label="Email Address *"
                    type="email"
                    placeholder="juan@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                </div>
                <div className="contact-form-fields-2col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <Input
                    label="Phone / Viber"
                    placeholder="+63 9XX XXX XXXX"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  />
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--ink)' }}>Subject</label>
                    <select
                      value={form.subject}
                      onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      style={{
                        width: '100%', padding: '10px 14px',
                        border: '1px solid var(--border)', borderRadius: 10,
                        fontSize: 14, background: 'white', color: 'var(--ink)',
                        fontFamily: 'var(--font-body)',
                      }}
                    >
                      <option value="">Select a topic</option>
                      <option value="booking">Booking Inquiry</option>
                      <option value="pricing">Pricing Question</option>
                      <option value="complaint">Service Complaint</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <Textarea
                    label="Message *"
                    placeholder="Tell us how we can help you..."
                    rows={5}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" style={{ width: '100%' }}>
                  Send Message
                </Button>
                <p style={{ fontSize: 12, color: 'var(--slate)', textAlign: 'center', marginTop: 12 }}>
                  We respect your privacy. Your information is never shared.
                </p>
              </form>
            )}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 72 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-display)', textAlign: 'center', marginBottom: 40 }}>Frequently Asked</h2>
          <div className="contact-faq-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {[
              { q: 'How do I book a service?', a: "Click \"Book a Service\" on our website, create an account, and complete the 5-step booking wizard. You'll receive a confirmation once we verify your reservation fee." },
              { q: 'How long does a cleaning take?', a: 'Basic cleaning takes 45–60 minutes per unit. Deep cleaning takes 90–120 minutes. Exact time depends on unit condition and type.' },
              { q: 'Do I need to be home?', a: 'Yes, an adult (18+) must be present during the service. Our technicians will not proceed without homeowner authorization.' },
              { q: 'What if my unit has a problem after service?', a: "We offer a service guarantee. If you experience issues within 7 days, we'll return for a free re-inspection." },
              { q: 'How do I pay?', a: 'We accept GCash, bank transfer, and cash. A ₱300–₱500 reservation fee is required to confirm your booking.' },
              { q: 'Are your technicians certified?', a: 'All ACT technicians are TESDA-certified and DICT-registered. We can provide credentials upon request.' },
            ].map(faq => (
              <div key={faq.q} style={{
                background: 'white', border: '1px solid var(--border)', borderRadius: 16,
                padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ fontWeight: 700, marginBottom: 10, color: 'var(--polar)' }}>Q: {faq.q}</div>
                <div style={{ color: 'var(--slate)', fontSize: 14, lineHeight: 1.7 }}>A: {faq.a}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
