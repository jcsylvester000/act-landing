import { prisma } from '@/lib/prisma';
import { ok, fail, toApp, fromApp, omit } from '@/lib/api';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = fromApp(await req.json()) as Record<string, unknown>;
    const data = omit(body, ['id', 'createdAt', 'updatedAt']);
    const tech = await prisma.technician.update({ where: { id }, data: data as never });
    return ok(toApp(tech));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to update technician.', 500);
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const tech = await prisma.technician.findUnique({ where: { id } });
    if (!tech) return fail('Technician not found.', 404);
    return ok(toApp(tech));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load technician.', 500);
  }
}
