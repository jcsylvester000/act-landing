// ─── SESSION (HTTP-only signed cookie) ────────────────────────────────────────
// Lightweight HMAC-signed session token: "<userId>.<role>.<expires>.<sig>"
// Set on login/register, read by /api/auth/me, cleared by /api/auth/logout.
// Requires SESSION_SECRET in .env.

import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'act_session';
const MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url');
}

export function createSessionCookie(userId: string, role: string): string {
  const expires = Date.now() + MAX_AGE_S * 1000;
  const payload = `${userId}.${role}.${expires}`;
  const token = `${payload}.${sign(payload)}`;
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly;${secure} SameSite=Lax; Path=/; Max-Age=${MAX_AGE_S}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`;
}

export function readSession(req: Request): { userId: string; role: string } | null {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;
  const parts = match[1].split('.');
  if (parts.length !== 4) return null;
  const [userId, role, expires, sig] = parts;
  const payload = `${userId}.${role}.${expires}`;
  const expected = sign(payload);
  try {
    if (!timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch { return null; }
  if (Number(expires) < Date.now()) return null;
  return { userId, role };
}
