import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const users = await prisma.client.findMany({
      where: role ? { role: role as never } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    return ok(toApp(users.map(({ passwordHash: _ph, ...u }) => u)));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load clients.', 500);
  }
}
