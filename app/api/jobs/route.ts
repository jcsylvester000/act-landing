import { prisma } from '@/lib/prisma';
import { ok, fail, toApp, fromApp } from '@/lib/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const status = searchParams.get('status');
    const jobs = await prisma.job.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(status ? { status: fromApp(status) as never } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { client: { select: { firstName: true, lastName: true } }, assignments: { orderBy: { assignedAt: 'desc' }, take: 1, include: { technician: true } } },
    });
    return ok(toApp(jobs));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load jobs.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = fromApp(await req.json()) as Record<string, unknown>;
    const required = ['clientId', 'serviceType', 'acType', 'serviceAddress', 'city', 'preferredDate'];
    for (const f of required) if (!body[f]) return fail(`${f} is required.`);

    const client = await prisma.client.findUnique({ where: { id: String(body.clientId) } });
    if (!client) return fail('Client not found.', 404);

    const totalPrice = Number(body.totalPrice ?? 0);
    const reservationFee = Number(body.reservationFee ?? 0);
    const job = await prisma.job.create({
      data: {
        ...(body.id ? { id: String(body.id) } : {}),
        clientId: String(body.clientId),
        serviceType: body.serviceType as never,
        acType: String(body.acType),
        numberOfUnits: Number(body.numberOfUnits ?? 1),
        serviceAddress: String(body.serviceAddress),
        city: body.city as never,
        preferredDate: new Date(String(body.preferredDate)),
        timeSlot: (body.timeSlot as never) ?? 'AM',
        totalPrice,
        reservationFee,
        balanceDue: Number(body.balanceDue ?? Math.max(0, totalPrice - reservationFee)),
        requiresQuote: Boolean(body.requiresQuote ?? false),
        paymentStatus: (body.paymentStatus as never) ?? 'Unpaid',
        preferredPaymentMethod: (body.preferredPaymentMethod as never) ?? null,
        status: (body.status as never) ?? 'Pending',
        specialInstructions: body.specialInstructions ? String(body.specialInstructions) : null,
        isAdminCreated: Boolean(body.isAdminCreated ?? false),
        preferredTechnicianId: body.preferredTechnicianId ? String(body.preferredTechnicianId) : null,
        preferredTechnicianName: body.preferredTechnicianName ? String(body.preferredTechnicianName) : null,
        technicianId: body.technicianId ? String(body.technicianId) : null,
        technicianName: body.technicianName ? String(body.technicianName) : null,
        operatorId: body.operatorId ? String(body.operatorId) : null,
        operatorName: body.operatorName ? String(body.operatorName) : null,
        customPrice: body.customPrice !== undefined && body.customPrice !== null ? Number(body.customPrice) : null,
      },
    });

    // Parity with store: notify admin of new booking
    const admin = await prisma.client.findFirst({ where: { role: 'admin' } });
    if (admin) {
      await prisma.notification.create({
        data: {
          userId: admin.id, jobId: job.id, type: 'info',
          message: `New booking from ${client.firstName} ${client.lastName} — review and assign a technician.`,
        },
      });
    }
    return ok(toApp(job), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to create job.', 500);
  }
}
