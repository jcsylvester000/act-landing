'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store';
import { Button } from '@/components/ui';

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout, notifications, markNotificationRead } = useStore();

  // ─── All state hooks together (Rules of Hooks) ───────────────────────────
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ─── Derived values (safe-guarded for SSR where notifications may be empty) ─
  const safeNotifs = notifications ?? [];
  const unreadNotifs = safeNotifs.filter(n => n.userId === currentUser?.id && !n.read);
  const myNotifs = safeNotifs.filter(n => n.userId === currentUser?.id).slice(0, 5);

  const isHeroPage = ['/', '/services', '/about', '/coverage', '/contact'].includes(pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); setNotifOpen(false); }, [pathname]);

  useEffect(() => {
    if (!dropdownOpen && !notifOpen) return;
    const handler = () => { setDropdownOpen(false); setNotifOpen(false); };
    setTimeout(() => document.addEventListener('click', handler), 0);
    return () => document.removeEventListener('click', handler);
  }, [dropdownOpen, notifOpen]);

  const isTransparent = isHeroPage && !scrolled;

  const navLinks = [
    { label: 'Services', path: '/services' },
    { label: 'Coverage', path: '/coverage' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: scrolled ? 64 : 72,
        background: isTransparent ? 'transparent' : 'rgba(247,251,252,0.92)',
        backdropFilter: !isTransparent ? 'blur(24px) saturate(180%)' : 'none',
        WebkitBackdropFilter: !isTransparent ? 'blur(24px) saturate(180%)' : 'none',
        borderBottom: !isTransparent ? '1px solid rgba(214,227,232,0.6)' : 'none',
        boxShadow: scrolled && !isTransparent ? '0 2px 20px rgba(6,42,61,0.08)' : 'none',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '100%',
        }}>
          {/* ─── LOGO ─── */}
          <button
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isTransparent ? '0 4px 12px rgba(0,0,0,0.2)' : '0 2px 8px rgba(10,110,143,0.2)',
              transition: 'box-shadow 0.3s',
            }}>
              <img src="/logo-act.png" alt="ACT" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800,
                color: isTransparent ? 'white' : 'var(--midnight)',
                letterSpacing: '-0.5px', transition: 'color 0.3s',
              }}>
                ACT<span style={{ color: 'var(--ember)' }}>.</span>
              </span>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: isTransparent ? 'rgba(255,255,255,0.5)' : 'var(--slate)',
                transition: 'color 0.3s',
              }}>
                Aircon Services
              </span>
            </div>
          </button>

          {/* ─── DESKTOP NAV ─── */}
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }} className="hide-mobile">
            {navLinks.map(({ label, path }) => {
              const active = pathname === path;
              return (
                <button
                  key={path}
                  onClick={() => router.push(path)}
                  style={{
                    position: 'relative', padding: '8px 16px',
                    background: active ? (isTransparent ? 'rgba(255,255,255,0.12)' : 'var(--breeze)') : 'none',
                    border: 'none', borderRadius: 10, cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: active ? 700 : 500,
                    color: isTransparent ? (active ? 'white' : 'rgba(255,255,255,0.8)') : (active ? 'var(--polar)' : 'var(--ink)'),
                    transition: 'all 0.2s',
                    letterSpacing: active ? '-0.2px' : '0',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget;
                    if (!active) {
                      el.style.background = isTransparent ? 'rgba(255,255,255,0.1)' : 'var(--breeze)';
                      el.style.color = isTransparent ? 'white' : 'var(--polar)';
                    }
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget;
                    if (!active) {
                      el.style.background = 'none';
                      el.style.color = isTransparent ? 'rgba(255,255,255,0.8)' : 'var(--ink)';
                    }
                  }}
                >
                  {label}
                  {active && (
                    <span style={{
                      position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)',
                      width: 20, height: 2.5, borderRadius: 99,
                      background: isTransparent ? 'var(--frost)' : 'var(--polar)',
                      display: 'block',
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* ─── AUTH / CTA ─── */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Notification Bell — logged-in only */}
            {currentUser && (
              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => { setNotifOpen(v => !v); setDropdownOpen(false); }}
                  style={{
                    position: 'relative', width: 38, height: 38, borderRadius: 10,
                    background: isTransparent ? 'rgba(255,255,255,0.1)' : 'var(--snow)',
                    border: isTransparent ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 17, transition: 'all 0.2s',
                  }}
                  title="Notifications"
                >
                  🔔
                  {unreadNotifs.length > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'var(--ember)', color: 'white',
                      fontSize: 10, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid white',
                    }}>
                      {unreadNotifs.length > 9 ? '9+' : unreadNotifs.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--white)', border: '1px solid var(--border)',
                    borderRadius: 16, width: 320, maxHeight: 380, overflowY: 'auto',
                    boxShadow: '0 16px 48px rgba(6,42,61,0.15)',
                    zIndex: 200, animation: 'navSlideIn 0.2s cubic-bezier(0.16,1,0.3,1) both',
                  }}>
                    <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>Notifications</span>
                      {unreadNotifs.length > 0 && (
                        <button onClick={() => { unreadNotifs.forEach(n => markNotificationRead(n.id)); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--polar)', fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    {myNotifs.length === 0 ? (
                      <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--slate)', fontSize: 13 }}>
                        No notifications yet
                      </div>
                    ) : myNotifs.map(n => (
                      <div key={n.id} onClick={() => markNotificationRead(n.id)} style={{
                        padding: '12px 16px', borderBottom: '1px solid var(--border)',
                        background: n.read ? 'transparent' : 'rgba(10,110,143,0.04)',
                        cursor: 'pointer', transition: 'background 0.15s',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--snow)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(10,110,143,0.04)'; }}
                      >
                        <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>
                          {n.type === 'success' ? '✅' : n.type === 'error' ? '❌' : n.type === 'warning' ? '⚠️' : 'ℹ️'}
                        </span>
                        <div>
                          <div style={{ fontSize: 13, color: 'var(--ink)', lineHeight: 1.5 }}>{n.message}</div>
                          {!n.read && (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--polar)', display: 'inline-block', marginTop: 4 }} />
                          )}
                        </div>
                      </div>
                    ))}
                    {myNotifs.length > 0 && (
                      <div style={{ padding: '10px 16px', textAlign: 'center' }}>
                        <button onClick={() => { setNotifOpen(false); router.push('/dashboard'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--polar)', fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 600 }}>
                          View all in Dashboard
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentUser ? (
              <div style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setDropdownOpen(v => !v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    background: isTransparent ? 'rgba(255,255,255,0.12)' : 'var(--white)',
                    border: isTransparent ? '1px solid rgba(255,255,255,0.2)' : '1.5px solid var(--border)',
                    borderRadius: 12, padding: '8px 14px', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', transition: 'all 0.2s',
                    boxShadow: isTransparent ? 'none' : 'var(--shadow-xs)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = isTransparent ? 'none' : 'var(--shadow-xs)'; }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--polar), var(--frost))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 12, fontWeight: 800, flexShrink: 0,
                    boxShadow: '0 2px 6px rgba(10,110,143,0.3)',
                  }}>
                    {currentUser.firstName[0].toUpperCase()}
                  </div>
                  <span style={{ fontWeight: 600, fontSize: 14, color: isTransparent ? 'white' : 'var(--ink)' }}>
                    {currentUser.firstName}
                  </span>
                  <span style={{
                    color: isTransparent ? 'rgba(255,255,255,0.5)' : 'var(--slate)',
                    fontSize: 10, transition: 'transform 0.2s',
                    transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    display: 'inline-block',
                  }}>▼</span>
                </button>

                {dropdownOpen && (
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--white)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '8px', minWidth: 200,
                    boxShadow: '0 16px 48px rgba(6,42,61,0.15)',
                    zIndex: 200, animation: 'navSlideIn 0.2s cubic-bezier(0.16,1,0.3,1) both',
                  }}>
                    <div style={{ padding: '10px 12px 12px', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{currentUser.firstName} {currentUser.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--slate)', marginTop: 1 }}>{currentUser.email}</div>
                      <div style={{ marginTop: 6 }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px',
                          background: currentUser.role === 'admin' ? 'rgba(255,107,74,0.1)' : currentUser.role === 'operator' ? 'rgba(91,196,214,0.12)' : 'rgba(10,110,143,0.1)',
                          color: currentUser.role === 'admin' ? 'var(--ember-dark)' : currentUser.role === 'operator' ? 'var(--frost)' : 'var(--polar)',
                          borderRadius: 99, textTransform: 'uppercase', letterSpacing: '0.5px',
                        }}>
                          {currentUser.role === 'operator' ? 'Operator' : currentUser.role}
                        </span>
                      </div>
                    </div>

                    {[
                      {
                        label: currentUser.role === 'admin' ? 'Admin Panel' : currentUser.role === 'operator' ? 'Operator Dashboard' : 'Dashboard',
                        icon: currentUser.role === 'admin' ? '⚙️' : currentUser.role === 'operator' ? '🧑‍💼' : '⊞',
                        path: currentUser.role === 'admin' ? '/admin' : currentUser.role === 'operator' ? '/operator-dashboard' : '/dashboard',
                      },
                      ...(currentUser.role === 'client' ? [
                        { label: 'My Jobs', icon: '📋', path: '/jobs' },
                        { label: 'Book Service', icon: '📅', path: '/book' },
                      ] : []),
                      ...(currentUser.role === 'operator' ? [
                        { label: 'Messages', icon: '💬', path: '/operator-dashboard' },
                        { label: 'My Schedule', icon: '🗓️', path: '/operator-dashboard' },
                      ] : []),
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => { router.push(item.path); setDropdownOpen(false); }}
                        style={{
                          display: 'flex', width: '100%', padding: '9px 12px',
                          background: 'none', border: 'none', cursor: 'pointer',
                          textAlign: 'left', fontFamily: 'var(--font-body)',
                          fontSize: 14, color: 'var(--ink)', borderRadius: 8,
                          alignItems: 'center', gap: 10, transition: 'background 0.15s',
                          fontWeight: 500,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--snow)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                      >
                        <span style={{ fontSize: 16 }}>{item.icon}</span>
                        {item.label}
                      </button>
                    ))}

                    <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'flex', width: '100%', padding: '9px 12px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        textAlign: 'left', fontFamily: 'var(--font-body)',
                        fontSize: 14, color: 'var(--alert)', borderRadius: 8,
                        alignItems: 'center', gap: 10, transition: 'background 0.15s', fontWeight: 600,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--alert-bg)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                    >
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  onClick={() => router.push('/login')}
                  className="hide-mobile"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600,
                    color: isTransparent ? 'rgba(255,255,255,0.8)' : 'var(--polar)',
                    padding: '8px 14px', borderRadius: 10, transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isTransparent ? 'rgba(255,255,255,0.1)' : 'var(--breeze)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  Sign In
                </button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => router.push('/book')}
                  style={{ fontWeight: 700, letterSpacing: '-0.2px' }}
                >
                  Book Now
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="hide-desktop"
              onClick={() => setMobileOpen(v => !v)}
              style={{
                background: isTransparent ? 'rgba(255,255,255,0.12)' : 'var(--snow)',
                border: 'none', borderRadius: 10, width: 40, height: 40,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: mobileOpen ? 0 : 5, cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  display: 'block', width: 20,
                  height: 2, borderRadius: 99,
                  background: isTransparent ? 'white' : 'var(--ink)',
                  transition: 'all 0.3s',
                  transform: mobileOpen
                    ? i === 0 ? 'rotate(45deg) translate(5px, 5px)' : i === 2 ? 'rotate(-45deg) translate(5px, -5px)' : 'none'
                    : 'none',
                  opacity: mobileOpen && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── MOBILE MENU ─── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99,
        pointerEvents: mobileOpen ? 'all' : 'none',
      }}>
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'rgba(6,42,61,0.6)',
            backdropFilter: 'blur(4px)',
            opacity: mobileOpen ? 1 : 0,
            transition: 'opacity 0.3s',
          }}
          onClick={() => setMobileOpen(false)}
        />
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: '80%', maxWidth: 320,
          background: 'var(--white)', boxShadow: '-8px 0 32px rgba(6,42,61,0.15)',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex', flexDirection: 'column', paddingTop: 80,
        }}>
          <div style={{ padding: '0 20px 20px', borderBottom: '1px solid var(--border)' }}>
            {navLinks.map(({ label, path }) => (
              <button
                key={path}
                onClick={() => router.push(path)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '14px 16px', borderRadius: 12,
                  background: pathname === path ? 'var(--breeze)' : 'none',
                  border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600,
                  color: pathname === path ? 'var(--polar)' : 'var(--ink)',
                  marginBottom: 4,
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {!currentUser ? (
              <>
                <Button variant="secondary" fullWidth onClick={() => router.push('/login')}>Sign In</Button>
                <Button variant="primary" fullWidth onClick={() => router.push('/book')}>Book Now →</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" fullWidth onClick={() => router.push(currentUser.role === 'admin' ? '/admin' : '/dashboard')}>Dashboard</Button>
                <Button variant="ghost" fullWidth onClick={handleLogout}>Sign Out</Button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .hide-desktop { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default Navbar;
