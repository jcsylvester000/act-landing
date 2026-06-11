import { prisma } from '@/lib/prisma';
import { ok, fail, fromApp, toApp } from '@/lib/api';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = fromApp(await req.json());
    const { firstName, lastName, email, password, phone, address, city, clientType, acUnits } = body;
    if (!firstName || !lastName || !email || !password || !phone) {
      return fail('firstName, lastName, email, password, and phone are required.');
    }
    if (String(password).length < 6) return fail('Password must be at least 6 characters.');
    const existing = await prisma.client.findUnique({ where: { email: String(email).trim().toLowerCase() } });
    if (existing) return fail('An account with this email already exists.', 409);

    const user = await prisma.client.create({
      data: {
        firstName, lastName, phone,
        email: String(email).trim().toLowerCase(),
        passwordHash: await bcrypt.hash(String(password), 10),
        role: 'client',
        address: address || null,
        city: city || null,
        clientType: clientType || null,
        acUnits: acUnits ? Number(acUnits) : null,
      },
    });
    const { passwordHash: _ph, ...safe } = user;
    return ok(toApp(safe), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Registration failed.', 500);
  }
}
