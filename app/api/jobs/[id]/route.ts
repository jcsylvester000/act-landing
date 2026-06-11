import { prisma } from '@/lib/prisma';
import { ok, fail, toApp, fromApp, omit } from '@/lib/api';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        assignments: { orderBy: { assignedAt: 'desc' }, include: { technician: true } },
        invoices: true,
        reviews: true,
      },
    });
    if (!job) return fail('Job not found.', 404);
    return ok(toApp(job));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load job.', 500);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = fromApp(await req.json()) as Record<string, unknown>;
    const prev = await prisma.job.findUnique({ where: { id }, include: { client: true } });
    if (!prev) return fail('Job not found.', 404);

    const clientManaged = Boolean((body as { clientManaged?: unknown }).clientManaged);
    const data = omit(body, ['id', 'clientId', 'clientName', 'createdAt', 'updatedAt', 'clientManaged', 'action', 'nextDueDate']);
    if (data.preferredDate) data.preferredDate = new Date(String(data.preferredDate));

    const job = await prisma.job.update({ where: { id }, data: data as never });

    // ── Side effects (parity with store.updateJob) — skipped when the app store
    // manages them itself (dual-write mode sends clientManaged: true) ──
    const completing = !clientManaged && body.status === 'Completed' && prev.status !== 'Completed';
    const cancelling = !clientManaged && body.status === 'Cancelled' && prev.status !== 'Cancelled';

    if (completing) {
      await prisma.notification.create({
        data: { userId: prev.clientId, jobId: id, type: 'success', message: `Your service is complete! Please rate your experience. ⭐` },
      });
      // Guarantee: every completed job has a billing record
      const hasBilling = await prisma.invoice.findFirst({ where: { jobId: id, kind: 'billing_statement' } });
      if (!hasBilling) {
        const subtotal = Number(prev.totalPrice);
        await prisma.invoice.create({
          data: {
            jobId: id, kind: 'billing_statement', clientId: prev.clientId,
            lineItems: [{ id: '1', description: `${prev.serviceType} — ${prev.acType} (×${prev.numberOfUnits})`, category: 'Service', quantity: prev.numberOfUnits, unitPrice: prev.numberOfUnits > 0 ? subtotal / prev.numberOfUnits : subtotal, amount: subtotal }],
            subtotal, totalAmount: subtotal,
            reservationFeePaid: prev.reservationFee,
            amountDue: Math.max(0, subtotal - Number(prev.reservationFee)),
            billingStatus: 'Draft',
            workNotes: (body.techFieldNotes as string) || prev.techFieldNotes || null,
          },
        });
      }
      // Service history entry
      await prisma.serviceHistory.upsert({
        where: { jobId: id },
        update: {},
        create: {
          clientId: prev.clientId, jobId: id, serviceType: prev.serviceType,
          completedAt: new Date(), unitsServiced: prev.numberOfUnits,
          amountPaid: prev.totalPrice, workNotes: (body.techFieldNotes as string) || null,
        },
      });
    }

    if (cancelling) {
      const admin = await prisma.client.findFirst({ where: { role: 'admin' } });
      if (admin) {
        await prisma.notification.create({
          data: { userId: admin.id, jobId: id, type: 'warning', message: `Job ${id} (${prev.client.firstName} ${prev.client.lastName}) was cancelled.${body.cancelReason ? ' Reason: ' + body.cancelReason : ''}` },
        });
      }
    }

    return ok(toApp(job));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to update job.', 500);
  }
}
