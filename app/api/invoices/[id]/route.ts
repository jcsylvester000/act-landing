import { prisma } from '@/lib/prisma';
import { ok, fail, toApp, fromApp, omit } from '@/lib/api';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = (await req.json()) as Record<string, unknown>;
    const action = raw.action ? String(raw.action) : null;
    const body = fromApp(raw) as Record<string, unknown>;
    const inv = await prisma.invoice.findUnique({ where: { id } });
    if (!inv) return fail('Invoice not found.', 404);

    // ── action: markPaid — full proof-of-payment side effects ──
    if (action === 'markPaid') {
      const receiptNumber = inv.receiptNumber || `OR-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const updated = await prisma.invoice.update({
        where: { id },
        data: {
          billingStatus: 'Paid',
          paidAt: new Date(),
          paymentMethod: (body.paymentMethod as never) ?? 'Cash',
          paymentReference: body.paymentReference ? String(body.paymentReference) : null,
          receiptNumber,
          amountPaidAtClose: inv.amountDue,
          amountDue: 0,
        },
      });
      await prisma.job.update({ where: { id: inv.jobId }, data: { paymentStatus: 'FullyPaid', balanceDue: 0 } });
      await prisma.notification.create({
        data: { userId: inv.clientId, jobId: inv.jobId, type: 'success', message: `Payment received! Official Receipt ${receiptNumber} issued. Thank you for choosing ACT! 🙏` },
      });
      return ok(toApp(updated));
    }

    // ── generic field update ──
    const data = omit(body, ['id', 'jobId', 'clientId', 'kind', 'createdAt', 'updatedAt', 'action']);
    if (data.dueDate) data.dueDate = new Date(String(data.dueDate));
    for (const k of ['sentAt', 'sentToClientAt', 'adminReviewedAt', 'revisedAt', 'paidAt']) {
      if (data[k]) data[k] = new Date(String(data[k]));
    }
    const updated = await prisma.invoice.update({ where: { id }, data: data as never });
    return ok(toApp(updated));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to update invoice.', 500);
  }
}
