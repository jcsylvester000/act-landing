import { prisma } from '@/lib/prisma';
import { ok, fail, toApp, fromApp, omit } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await prisma.client.findUnique({ where: { id } });
    if (!user) return fail('Client not found.', 404);
    const { passwordHash: _ph, ...safe } = user;
    return ok(toApp(safe));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load client.', 500);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = fromApp(await req.json()) as Record<string, unknown>;
    const data = omit(body, ['id', 'email', 'passwordHash', 'role', 'createdAt', 'updatedAt']);
    if (data.lastServiceDate) data.lastServiceDate = new Date(String(data.lastServiceDate));
    if (data.nextDueDate) data.nextDueDate = new Date(String(data.nextDueDate));
    const user = await prisma.client.update({ where: { id }, data: data as never });
    const { passwordHash: _ph, ...safe } = user;
    return ok(toApp(safe));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to update client.', 500);
  }
}
