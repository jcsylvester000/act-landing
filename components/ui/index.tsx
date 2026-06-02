'use client';

import React, { useEffect, useRef } from 'react';
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

// ─── BUTTON ───────────────────────────────────────────────────────────────────
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children, variant = 'primary', size = 'md', loading, fullWidth,
  icon, iconRight, className = '', disabled, style, ...props
}) => {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, fontFamily: 'var(--font-body)', fontWeight: 700,
    borderRadius: 12, cursor: disabled || loading ? 'not-allowed' : 'pointer',
    border: 'none', outline: 'none', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    position: 'relative', overflow: 'hidden', letterSpacing: '0.1px',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled || loading ? 0.55 : 1,
    userSelect: 'none',
    WebkitFontSmoothing: 'antialiased',
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--ember) 0%, var(--ember-dark) 100%)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(255,107,74,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
    },
    secondary: {
      background: 'linear-gradient(135deg, var(--polar) 0%, var(--polar-dark) 100%)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(10,110,143,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--polar)',
      border: '1.5px solid var(--polar)',
      boxShadow: 'none',
    },
    danger: {
      background: 'linear-gradient(135deg, var(--alert) 0%, #cc3036 100%)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(229,72,77,0.3)',
    },
    success: {
      background: 'linear-gradient(135deg, var(--verified) 0%, #159069 100%)',
      color: 'white',
      boxShadow: '0 4px 14px rgba(27,168,126,0.3)',
    },
  };

  const sizes: Record<string, React.CSSProperties> = {
    xs: { fontSize: 12, padding: '5px 12px', borderRadius: 8 },
    sm: { fontSize: 13, padding: '8px 16px', borderRadius: 10 },
    md: { fontSize: 15, padding: '12px 22px' },
    lg: { fontSize: 16, padding: '15px 30px', borderRadius: 14 },
  };

  const merged = { ...base, ...variants[variant], ...sizes[size], ...style };

  return (
    <button
      disabled={disabled || loading}
      style={merged}
      className={className}
      onMouseEnter={e => {
        if (disabled || loading) return;
        const el = e.currentTarget;
        if (variant === 'primary') {
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 8px 20px rgba(255,107,74,0.5), inset 0 1px 0 rgba(255,255,255,0.15)';
        } else if (variant === 'secondary') {
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 8px 20px rgba(10,110,143,0.4), inset 0 1px 0 rgba(255,255,255,0.1)';
        } else if (variant === 'success') {
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 8px 20px rgba(27,168,126,0.45)';
        } else if (variant === 'danger') {
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 8px 20px rgba(229,72,77,0.45)';
        } else if (variant === 'ghost') {
          el.style.background = 'var(--breeze)';
        }
      }}
      onMouseLeave={e => {
        const el = e.currentTarget;
        el.style.transform = '';
        el.style.background = (merged.background as string) || '';
        el.style.boxShadow = (merged.boxShadow as string) || '';
      }}
      onMouseDown={e => { if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(0) scale(0.98)'; }}
      onMouseUp={e => { e.currentTarget.style.transform = ''; }}
      {...props}
    >
      {loading && (
        <span style={{ width: 15, height: 15, border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block', flexShrink: 0 }} />
      )}
      {!loading && icon}
      {children}
      {!loading && iconRight}
    </button>
  );
};

// ─── INPUT ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ label, error, hint, prefix, suffix, icon, id, style, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', letterSpacing: '0.2px', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)', display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}
        {prefix && (
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)', fontSize: 14, fontFamily: 'var(--font-mono)', pointerEvents: 'none' }}>
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          style={{
            width: '100%',
            padding: `13px ${suffix ? '40px' : '16px'} 13px ${icon ? '40px' : prefix ? '32px' : '16px'}`,
            background: 'var(--white)',
            border: `1.5px solid ${error ? 'var(--alert)' : 'var(--border)'}`,
            borderRadius: 12,
            fontSize: 15,
            fontFamily: 'var(--font-body)',
            color: 'var(--ink)',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            ...style,
          }}
          onFocus={e => {
            e.target.style.borderColor = error ? 'var(--alert)' : 'var(--polar)';
            e.target.style.boxShadow = error ? '0 0 0 3px rgba(229,72,77,0.1)' : '0 0 0 3px rgba(10,110,143,0.1)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? 'var(--alert)' : 'var(--border)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
        {suffix && (
          <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--slate)', fontSize: 13, pointerEvents: 'none' }}>
            {suffix}
          </span>
        )}
      </div>
      {error && (
        <span style={{ fontSize: 12, color: 'var(--alert)', fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>⚠</span> {error}
        </span>
      )}
      {hint && !error && (
        <span style={{ fontSize: 12, color: 'var(--slate)', fontFamily: 'var(--font-body)' }}>{hint}</span>
      )}
    </div>
  );
};

// ─── SELECT ───────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, error, options, id, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', letterSpacing: '0.2px', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <select
        id={inputId}
        style={{
          width: '100%', padding: '13px 40px 13px 16px',
          border: `1.5px solid ${error ? 'var(--alert)' : 'var(--border)'}`,
          borderRadius: 12, fontSize: 15,
          fontFamily: 'var(--font-body)', color: 'var(--ink)',
          background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='none' stroke='%235A7080' stroke-width='2' d='M1 1l5 5 5-5'/%3E%3C/svg%3E") no-repeat right 14px center`,
          outline: 'none', cursor: 'pointer', appearance: 'none',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--polar)'; e.target.style.boxShadow = '0 0 0 3px rgba(10,110,143,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span style={{ fontSize: 12, color: 'var(--alert)' }}>{error}</span>}
    </div>
  );
};

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, error, hint, id, style, ...props }) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label htmlFor={inputId} style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-body)', letterSpacing: '0.2px', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        style={{
          width: '100%', padding: '13px 16px',
          border: `1.5px solid ${error ? 'var(--alert)' : 'var(--border)'}`,
          borderRadius: 12, fontSize: 15,
          fontFamily: 'var(--font-body)', color: 'var(--ink)',
          background: 'var(--white)', outline: 'none',
          resize: 'vertical', minHeight: 110,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          lineHeight: 1.6,
          ...style,
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--polar)'; e.target.style.boxShadow = '0 0 0 3px rgba(10,110,143,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = error ? 'var(--alert)' : 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        {...props}
      />
      {error && <span style={{ fontSize: 12, color: 'var(--alert)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: 12, color: 'var(--slate)' }}>{hint}</span>}
    </div>
  );
};

// ─── CARD ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hover?: boolean;
  onClick?: () => void;
  padding?: number | string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', style, hover, onClick, padding = 24 }) => (
  <div
    className={`${hover ? 'card card-interactive' : 'card'} ${className}`}
    style={{ padding, ...style }}
    onClick={onClick}
  >
    {children}
  </div>
);

// ─── BADGE ────────────────────────────────────────────────────────────────────
interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
  size?: 'xs' | 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({ label, color, bg, size = 'sm', dot }) => {
  const statusMap: Record<string, { bg: string; color: string }> = {
    'Pending': { bg: '#FEF3C7', color: '#92400E' },
    'Awaiting Payment': { bg: '#FEF3C7', color: '#92400E' },
    'Confirmed': { bg: '#DBEAFE', color: '#1E40AF' },
    'Scheduled': { bg: '#E0F2FE', color: '#0369A1' },
    'Active': { bg: '#D1FAE5', color: '#065F46' },
    'Completed': { bg: '#D1FAE5', color: '#065F46' },
    'Cancelled': { bg: '#FEE2E2', color: '#991B1B' },
    'Fee paid': { bg: '#DBEAFE', color: '#1E40AF' },
    'Fully paid': { bg: '#D1FAE5', color: '#065F46' },
    'Awaiting Confirmation': { bg: '#FEF3C7', color: '#92400E' },
    'Unpaid': { bg: '#FEE2E2', color: '#991B1B' },
    'Refunded': { bg: '#F3F4F6', color: '#374151' },
    'Inhouse': { bg: '#EDE9FE', color: '#5B21B6' },
    'Outsource': { bg: '#FCE7F3', color: '#9D174D' },
    'Junior': { bg: '#E0F2FE', color: '#0369A1' },
    'Senior': { bg: '#D1FAE5', color: '#065F46' },
    'Lead': { bg: '#FEF3C7', color: '#92400E' },
    'On track': { bg: '#D1FAE5', color: '#065F46' },
    'Due soon': { bg: '#FEF3C7', color: '#92400E' },
    'Overdue': { bg: '#FEE2E2', color: '#991B1B' },
    'No response': { bg: '#F3F4F6', color: '#374151' },
    'Converted': { bg: '#D1FAE5', color: '#065F46' },
    'Active ': { bg: '#D1FAE5', color: '#065F46' },
  };
  const sc = statusMap[label] || { bg: bg || 'var(--breeze)', color: color || 'var(--polar)' };
  const paddings = { xs: '2px 8px', sm: '3px 10px', md: '5px 14px' };
  const sizes = { xs: 11, sm: 12, md: 13 };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: dot ? 5 : 0,
      padding: paddings[size], borderRadius: 99,
      fontSize: sizes[size], fontWeight: 700,
      fontFamily: 'var(--font-body)',
      background: sc.bg, color: sc.color,
      whiteSpace: 'nowrap', letterSpacing: '0.2px',
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0, display: 'inline-block' }} />}
      {label}
    </span>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
export const Modal: React.FC<{
  open: boolean; onClose: () => void; title?: string;
  children: React.ReactNode; maxWidth?: number;
  subtitle?: string;
}> = ({ open, onClose, title, subtitle, children, maxWidth = 500 }) => {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(6,42,61,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease both' }} />
      <div
        className="modal-inner"
        style={{
          position: 'relative', background: 'var(--white)', borderRadius: 20,
          padding: 0, width: '100%', maxWidth, maxHeight: '90vh',
          overflowY: 'auto', zIndex: 1, animation: 'fadeInUp 0.3s cubic-bezier(0.16,1,0.3,1) both',
          boxShadow: '0 24px 64px rgba(6,42,61,0.25)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div style={{ padding: '24px 28px 0', borderBottom: '1px solid var(--border)', paddingBottom: 20, marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.2 }}>{title}</h2>
                {subtitle && <p style={{ fontSize: 13, color: 'var(--slate)', marginTop: 4 }}>{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--snow)', border: '1px solid var(--border)', cursor: 'pointer', fontSize: 18, color: 'var(--slate)',
                  transition: 'all 0.15s', flexShrink: 0,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--alert)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--alert)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--snow)'; e.currentTarget.style.color = 'var(--slate)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
              >×</button>
            </div>
          </div>
        )}
        <div style={{ padding: 28 }}>{children}</div>
      </div>
    </div>
  );
};

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export const StatCard: React.FC<{
  label: string; value: string | number; sub?: string;
  accent?: string; icon?: React.ReactNode; trend?: 'up' | 'down' | 'neutral';
}> = ({ label, value, sub, accent = 'var(--polar)', icon, trend }) => (
  <div style={{
    background: 'var(--white)', borderRadius: 16, border: '1px solid var(--border)',
    padding: '20px 22px', display: 'flex', gap: 14, alignItems: 'flex-start',
    boxShadow: 'var(--shadow-xs)', transition: 'all 0.2s',
  }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)'; e.currentTarget.style.transform = ''; }}
  >
    {icon && (
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${accent}18`, border: `1px solid ${accent}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, color: accent, fontSize: 18,
      }}>{icon}</div>
    )}
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 12, color: 'var(--slate)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'var(--ink)', lineHeight: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
        {value}
        {trend && (
          <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: trend === 'up' ? 'var(--verified)' : trend === 'down' ? 'var(--alert)' : 'var(--slate)' }}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--slate)', marginTop: 4 }}>{sub}</div>}
    </div>
  </div>
);

// ─── PESO ─────────────────────────────────────────────────────────────────────
export const Peso: React.FC<{ amount: number; size?: number; color?: string; bold?: boolean }> = ({
  amount, size = 15, color = 'var(--ink)', bold = false,
}) => (
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: size, color, fontWeight: bold ? 700 : 500, letterSpacing: '-0.3px' }}>
    ₱{amount.toLocaleString()}
  </span>
);

// ─── TOAST ────────────────────────────────────────────────────────────────────
interface ToastProps { message: string; type: 'success' | 'error' | 'info' | 'warning'; visible: boolean; }
export const Toast: React.FC<ToastProps> = ({ message, type, visible }) => {
  const config = {
    success: { color: 'var(--verified)', bg: 'var(--verified-bg)', icon: '✓', label: 'Success' },
    error: { color: 'var(--alert)', bg: 'var(--alert-bg)', icon: '✕', label: 'Error' },
    info: { color: 'var(--polar)', bg: 'var(--breeze)', icon: 'ℹ', label: 'Info' },
    warning: { color: 'var(--caution)', bg: 'var(--caution-bg)', icon: '⚠', label: 'Warning' },
  };
  const c = config[type];
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: 'var(--white)', border: `1.5px solid ${c.color}`,
      borderRadius: 14, padding: 0, maxWidth: 340,
      boxShadow: '0 8px 32px rgba(6,42,61,0.15), 0 2px 8px rgba(6,42,61,0.08)',
      animation: 'toastIn 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
      overflow: 'hidden', display: 'flex',
    }}>
      <div style={{ width: 5, background: c.color, flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px 14px 14px' }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, fontSize: 14, fontWeight: 800, flexShrink: 0 }}>
          {c.icon}
        </div>
        <span style={{ fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)', lineHeight: 1.4 }}>{message}</span>
      </div>
    </div>
  );
};

// ─── STAR RATING ──────────────────────────────────────────────────────────────
export const StarRating: React.FC<{ value: number; max?: number; onChange?: (v: number) => void; size?: number }> = ({
  value, max = 5, onChange, size = 22,
}) => {
  const [hovered, setHovered] = React.useState(0);
  const display = hovered || value;
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          onClick={() => onChange?.(i + 1)}
          onMouseEnter={() => onChange && setHovered(i + 1)}
          onMouseLeave={() => onChange && setHovered(0)}
          style={{
            fontSize: size,
            cursor: onChange ? 'pointer' : 'default',
            color: i < display ? '#F5A623' : 'var(--mist)',
            transition: 'color 0.12s, transform 0.12s',
            transform: onChange && hovered === i + 1 ? 'scale(1.2)' : 'scale(1)',
            display: 'inline-block',
            lineHeight: 1,
          }}
        >★</span>
      ))}
    </div>
  );
};

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export const SectionHeader: React.FC<{
  eyebrow?: string; title: string; subtitle?: string;
  center?: boolean; dark?: boolean;
  className?: string;
}> = ({ eyebrow, title, subtitle, center = true, dark = false, className = '' }) => (
  <div className={className} style={{ textAlign: center ? 'center' : 'left', marginBottom: 52 }}>
    {eyebrow && (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center', gap: 6,
        background: dark ? 'rgba(91,196,214,0.12)' : 'var(--breeze)',
        border: dark ? '1px solid rgba(91,196,214,0.25)' : '1px solid rgba(10,110,143,0.12)',
        borderRadius: 99, padding: '5px 14px',
        fontSize: 12, fontWeight: 800, letterSpacing: '1.5px',
        color: dark ? 'var(--frost)' : 'var(--polar)',
        textTransform: 'uppercase', marginBottom: 18,
        fontFamily: 'var(--font-body)',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
        {eyebrow}
      </div>
    )}
    <h2 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 'clamp(28px, 4vw, 46px)',
      fontWeight: 800, lineHeight: 1.1,
      color: dark ? 'white' : 'var(--midnight)',
      marginBottom: subtitle ? 16 : 0,
      letterSpacing: '-0.5px',
    }}>{title}</h2>
    {subtitle && (
      <p style={{
        fontSize: 17, color: dark ? 'rgba(255,255,255,0.65)' : 'var(--slate)',
        maxWidth: center ? 580 : undefined,
        margin: center ? '0 auto' : undefined,
        lineHeight: 1.65,
      }}>{subtitle}</p>
    )}
  </div>
);

// ─── DIVIDER ─────────────────────────────────────────────────────────────────
export const Divider: React.FC<{ my?: number }> = ({ my = 24 }) => (
  <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--mist), transparent)', margin: `${my}px 0` }} />
);

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export const ProgressBar: React.FC<{ value: number; max?: number; color?: string; height?: number; animated?: boolean }> = ({
  value, max = 100, color = 'var(--polar)', height = 6, animated = true,
}) => {
  const pct = Math.min(100, (value / max) * 100);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (barRef.current && animated) {
      barRef.current.style.width = '0%';
      requestAnimationFrame(() => {
        setTimeout(() => { if (barRef.current) barRef.current.style.width = `${pct}%`; }, 50);
      });
    }
  }, [pct, animated]);
  return (
    <div style={{ background: 'var(--border)', borderRadius: 99, overflow: 'hidden', height }}>
      <div
        ref={barRef}
        style={{
          height: '100%', width: animated ? '0%' : `${pct}%`,
          background: color, borderRadius: 99,
          transition: animated ? 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' : 'none',
        }}
      />
    </div>
  );
};

// ─── SKELETON ─────────────────────────────────────────────────────────────────
export const Skeleton: React.FC<{ width?: number | string; height?: number; radius?: number; style?: React.CSSProperties }> = ({
  width = '100%', height = 16, radius = 8, style,
}) => (
  <div style={{
    width, height, borderRadius: radius,
    background: 'linear-gradient(90deg, var(--border) 25%, var(--breeze) 50%, var(--border) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    ...style,
  }} />
);
