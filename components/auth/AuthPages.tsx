'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store';
import { Button, Input, Toast } from '@/components/ui';

// ─── AUTH SIDE PANEL ──────────────────────────────────────────────────────────
const AuthPanel: React.FC = () => (
  <div className="auth-side-panel hide-mobile" style={{
    flex: 1, background: 'linear-gradient(160deg, var(--midnight) 0%, var(--polar) 70%, var(--frost) 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'center',
    padding: '60px 52px', position: 'relative', overflow: 'hidden',
    minHeight: 500,
  }}>
    {[
      { w: 280, h: 280, top: '-10%', left: '-5%', color: 'rgba(91,196,214,0.08)' },
      { w: 200, h: 200, bottom: '10%', right: '-5%', color: 'rgba(10,110,143,0.12)' },
      { w: 150, h: 150, top: '50%', left: '60%', color: 'rgba(91,196,214,0.06)' },
    ].map((blob, i) => (
      <div key={i} style={{
        position: 'absolute', width: blob.w, height: blob.h, borderRadius: '50%',
        background: blob.color, top: (blob as { top?: string }).top, left: (blob as { left?: string }).left,
        bottom: (blob as { bottom?: string }).bottom, right: (blob as { right?: string }).right,
        animation: `orbFloat ${5 + i}s ease-in-out infinite`, animationDelay: `${i * 1.5}s`,
        filter: 'blur(1px)',
      }} />
    ))}

    <div style={{ position: 'relative', zIndex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 52 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
          <img src="/logo-act.png" alt="ACT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
            ACT<span style={{ color: 'var(--ember)' }}>.</span>
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px', textTransform: 'uppercase' }}>Aircon Services</div>
        </div>
      </div>

      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'white', lineHeight: 1.15, marginBottom: 18, letterSpacing: '-0.5px' }}>
        Cool, clean,<br />certain.
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, lineHeight: 1.75, marginBottom: 44, maxWidth: 320 }}>
        Metro Manila&apos;s reliability-first aircon service. Accredited technicians, transparent pricing, guaranteed work.
      </p>

      {[
        { icon: '🏅', text: 'TESDA-certified, accredited technicians' },
        { icon: '💰', text: 'Fixed transparent pricing — no surprises' },
        { icon: '📋', text: 'Permanent digital service history' },
        { icon: '🔔', text: 'Automated follow-up reminders' },
      ].map((f, i) => (
        <div key={i} style={{
          display: 'flex', gap: 14, alignItems: 'center', marginBottom: 18,
          opacity: 0, animation: `fadeInLeft 0.5s ease ${0.4 + i * 0.1}s both`,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
          }}>{f.icon}</div>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: 500 }}>{f.text}</span>
        </div>
      ))}

      <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <img src="/accreditation-seal.png" alt="Accredited" style={{ width: 48, height: 48, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'rgba(255,255,255,0.85)' }}>ACT Accredited Service</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Government-recognized certification</div>
        </div>
      </div>
    </div>
  </div>
);

// ─── LOGIN PAGE ───────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { login } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { showToast('Please enter your email and password.', 'error'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const result = login(email, password);
    setLoading(false);
    if (result.success) {
      const currentUser = useStore.getState().currentUser;
      showToast(`Welcome back, ${currentUser?.firstName}!`, 'success');
      setTimeout(() => {
        if (result.role === 'admin') {
          router.push('/admin');
        } else if (result.role === 'operator') {
          router.push('/operator-dashboard');
        } else {
          // Redirect back to the page they were trying to visit, or client dashboard
          router.push(redirectTo || '/dashboard');
        }
      }, 500);
    } else {
      showToast('Invalid credentials. Try any email/password for client, or admin@test.com / admin for admin.', 'error');
    }
  };

  return (
    <div className="auth-layout" style={{ display: 'flex', minHeight: '100vh', paddingTop: 72, fontFamily: 'var(--font-body)' }}>
      <Toast {...toast} />
      <AuthPanel />

      <div className="auth-form-side" style={{
        width: '100%', maxWidth: 520, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 32px', background: 'var(--cloud)',
      }}>
        <div style={{ width: '100%', maxWidth: 420, animation: 'fadeInRight 0.6s var(--ease-out) both' }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--polar)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>
              Welcome Back
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--midnight)', letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.15 }}>
              Sign in to ACT
            </h1>
            <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.6 }}>
              Track your bookings, manage services, and access your service history.
            </p>
          </div>

          <div style={{
            background: 'rgba(91,196,214,0.08)', border: '1px solid rgba(91,196,214,0.2)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 32,
            display: 'flex', gap: 12, alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>💡</span>
            <div style={{ fontSize: 13, color: 'var(--slate)', lineHeight: 1.55 }}>
              <strong style={{ color: 'var(--polar)', display: 'block', marginBottom: 8 }}>Demo Login Credentials</strong>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Admin: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', background: 'var(--breeze)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>admin@test.com</span>
                  {' / '}<span style={{ fontFamily: 'var(--font-mono)', background: 'var(--breeze)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>admin</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Operator 1: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', background: 'var(--breeze)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>maria@act.ph</span>
                  {' / '}<span style={{ fontFamily: 'var(--font-mono)', background: 'var(--breeze)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>operator</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Operator 2: </span>
                  <span style={{ fontFamily: 'var(--font-mono)', background: 'var(--breeze)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>danny@act.ph</span>
                  {' / '}<span style={{ fontFamily: 'var(--font-mono)', background: 'var(--breeze)', padding: '1px 6px', borderRadius: 4, fontSize: 12 }}>operator</span>
                </div>
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--ink)' }}>Client: </span>
                  <span style={{ fontSize: 12, color: 'var(--slate)' }}>any email + any password</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Input
              label="Email Address"
              type="email"
              placeholder="juan@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--polar)', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} style={{ fontWeight: 800, marginTop: 4 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, fontSize: 14, color: 'var(--slate)' }}>
            New to ACT?{' '}
            <button onClick={() => router.push('/register')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--polar)', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── REGISTER PAGE ────────────────────────────────────────────────────────────
export const RegisterPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const { register } = useStore();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({ message: '', type: 'success', visible: false });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500);
  };

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required';
    if (!form.lastName.trim()) errs.lastName = 'Last name is required';
    if (!form.phone.match(/^(09|\+639)\d{9}$/)) errs.phone = 'Enter a valid PH mobile (09XX XXX XXXX)';
    if (!form.email.includes('@')) errs.email = 'Enter a valid email address';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    register({ email: form.email, password: form.password, firstName: form.firstName, lastName: form.lastName, phone: form.phone });
    showToast('Account created! Redirecting…', 'success');
    setTimeout(() => router.push(redirectTo || '/dashboard'), 1000);
    setLoading(false);
  };

  return (
    <div className="auth-layout" style={{ display: 'flex', minHeight: '100vh', paddingTop: 72, fontFamily: 'var(--font-body)' }}>
      <Toast {...toast} />
      <AuthPanel />

      <div className="auth-form-side" style={{
        width: '100%', maxWidth: 560, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '40px 32px', background: 'var(--cloud)',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 460, animation: 'fadeInRight 0.6s var(--ease-out) both' }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--polar)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 10 }}>
              New Account
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, color: 'var(--midnight)', letterSpacing: '-0.5px', marginBottom: 10, lineHeight: 1.15 }}>
              Create your ACT account
            </h1>
            <p style={{ color: 'var(--slate)', fontSize: 15, lineHeight: 1.6 }}>
              Join thousands of Metro Manila homeowners and businesses who trust ACT.
            </p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="auth-name-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="First Name" placeholder="Juan" value={form.firstName} onChange={e => set('firstName', e.target.value)} error={errors.firstName} />
              <Input label="Last Name" placeholder="dela Cruz" value={form.lastName} onChange={e => set('lastName', e.target.value)} error={errors.lastName} />
            </div>
            <Input label="Mobile Number" type="tel" placeholder="09XX XXX XXXX" value={form.phone} onChange={e => set('phone', e.target.value)} error={errors.phone} hint="Used for booking confirmations and reminders" />
            <Input label="Email Address" type="email" placeholder="juan@example.com" value={form.email} onChange={e => set('email', e.target.value)} error={errors.email} />
            <div className="auth-password-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <Input label="Password" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => set('password', e.target.value)} error={errors.password} />
              <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set('confirm', e.target.value)} error={errors.confirm} />
            </div>

            <p style={{ fontSize: 12, color: 'var(--slate)', lineHeight: 1.6, textAlign: 'center' }}>
              By registering, you agree to ACT&apos;s{' '}
              <span style={{ color: 'var(--polar)', fontWeight: 600, cursor: 'pointer' }}>Terms of Service</span> and{' '}
              <span style={{ color: 'var(--polar)', fontWeight: 600, cursor: 'pointer' }}>Privacy Policy</span>.
            </p>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading} style={{ fontWeight: 800 }}>
              {loading ? 'Creating Account...' : 'Create Account →'}
            </Button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--slate)' }}>
            Already have an account?{' '}
            <button onClick={() => router.push('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--polar)', fontWeight: 700, fontSize: 14, fontFamily: 'var(--font-body)' }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
