import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';
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
    return ok(toApp(safe));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Login failed.', 500);
  }
}
