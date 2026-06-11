import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';

export async function GET() {
  try {
    const items = await prisma.serviceCatalogItem.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    return ok(toApp(items));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load catalog.', 500);
  }
}
