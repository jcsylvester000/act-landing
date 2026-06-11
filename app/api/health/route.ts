import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';

export async function GET() {
  try {
    const [clients, technicians, jobs, services] = await Promise.all([
      prisma.client.count(),
      prisma.technician.count(),
      prisma.job.count(),
      prisma.serviceCatalogItem.count(),
    ]);
    return ok({ database: 'connected', clients, technicians, jobs, services });
  } catch (e) {
    return fail(`Database unreachable: ${e instanceof Error ? e.message : 'unknown'}`, 503);
  }
}
