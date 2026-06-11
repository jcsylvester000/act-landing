import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';
import { readSession } from '@/lib/session';

export async function GET(req: Request) {
  try {
    const session = readSession(req);
    if (!session) return fail('Not authenticated.', 401);
    const user = await prisma.client.findUnique({ where: { id: session.userId } });
    if (!user) return fail('Account not found.', 401);
    const { passwordHash: _ph, ...safe } = user;
    return ok(toApp(safe));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Session check failed.', 500);
  }
}
