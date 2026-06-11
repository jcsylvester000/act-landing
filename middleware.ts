// ─── API AUTH MIDDLEWARE (edge) ───────────────────────────────────────────────
// Enforces the signed act_session cookie on every /api route except the
// public allowlist. Verifies the HMAC with Web Crypto (edge-compatible —
// same token format as lib/session.ts). The scheduled chat-archive job may
// alternatively present the CRON_SECRET via the x-cron-key header.

import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me',      // self-handles 401 with a clean JSON body
  '/api/health',
  '/api/catalog',
]);

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split('.');
  if (parts.length !== 4) return false;
  const [userId, role, expires, sig] = parts;
  if (Number(expires) < Date.now()) return false;
  const payload = `${userId}.${role}.${expires}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const bytes = new Uint8Array(mac);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  const expected = btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return expected === sig;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith('/api')) return NextResponse.next();
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Scheduled archive job: allow with the cron secret header
  if (pathname === '/api/messages/archive' && req.method === 'POST') {
    const cronKey = req.headers.get('x-cron-key');
    if (cronKey && process.env.CRON_SECRET && cronKey === process.env.CRON_SECRET) {
      return NextResponse.next();
    }
  }

  const token = req.cookies.get('act_session')?.value;
  const secret = process.env.SESSION_SECRET;
  if (token && secret && (await verifyToken(token, secret))) {
    return NextResponse.next();
  }
  return NextResponse.json({ ok: false, error: 'Not authenticated.' }, { status: 401 });
}

export const config = {
  matcher: '/api/:path*',
};
