import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fail, toApp, serialize } from '@/lib/api';
import { createSessionCookie } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return fail('Email and password are required.');
    const user = await prisma.client.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (!user) return fail('Invalid email or password.', 401);
    const valid = await bcrypt.compare(String(password), user.passwordHash);
    if (!valid) return fail('Invalid email or password.', 401);
    const { passwordHash: _ph, ...safe } = user;
    const res = NextResponse.json({ ok: true, data: serialize(toApp(safe)) });
    res.headers.set('Set-Cookie', createSessionCookie(user.id, user.role));
    return res;
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Login failed.', 500);
  }
}
