import { prisma } from '@/lib/prisma';
import { ok, fail, toApp, fromApp } from '@/lib/api';

export async function GET() {
  try {
    const techs = await prisma.technician.findMany({ orderBy: { fullName: 'asc' } });
    return ok(toApp(techs));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load technicians.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = fromApp(await req.json());
    const { fullName, phone, type, skillLevel, coverageCities } = body;
    if (!fullName || !phone) return fail('fullName and phone are required.');
    const tech = await prisma.technician.create({
      data: {
        fullName, phone,
        type: type || 'Outsource',
        skillLevel: skillLevel || 'Junior',
        coverageCities: coverageCities || [],
        isAvailable: true, active: true,
      },
    });
    return ok(toApp(tech), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to create technician.', 500);
  }
}
