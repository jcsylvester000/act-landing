import { prisma } from '@/lib/prisma';
import { ok, fail, toApp, fromApp } from '@/lib/api';

// kind: "service_invoice" (pre-service quote) | "billing_statement" (post-service)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const clientId = searchParams.get('clientId');
    const kind = searchParams.get('kind');
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(jobId ? { jobId } : {}),
        ...(clientId ? { clientId } : {}),
        ...(kind ? { kind } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(toApp(invoices));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load invoices.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = fromApp(await req.json()) as Record<string, unknown>;
    const { jobId, kind, clientId, lineItems, subtotal } = body;
    if (!jobId || !kind || !clientId || !lineItems || subtotal === undefined) {
      return fail('jobId, kind, clientId, lineItems, and subtotal are required.');
    }
    if (kind !== 'service_invoice' && kind !== 'billing_statement') {
      return fail('kind must be "service_invoice" or "billing_statement".');
    }
    const sub = Number(subtotal);
    const resFee = Number(body.reservationFeePaid ?? 0);
    const invoice = await prisma.invoice.create({
      data: {
        ...(body.id ? { id: String(body.id) } : {}),
        jobId: String(jobId), kind: String(kind), clientId: String(clientId),
        clientName: body.clientName ? String(body.clientName) : null,
        operatorName: body.operatorName ? String(body.operatorName) : null,
        operatorId: body.operatorId ? String(body.operatorId) : null,
        technicianName: body.technicianName ? String(body.technicianName) : null,
        lineItems: lineItems as never,
        subtotal: sub,
        reservationFeePaid: resFee,
        totalAmount: Number(body.totalAmount ?? sub),
        amountDue: Number(body.amountDue ?? Math.max(0, sub - resFee)),
        invoiceStatus: kind === 'service_invoice' ? ((body.invoiceStatus as never) ?? 'Draft') : null,
        billingStatus: kind === 'billing_statement' ? ((body.billingStatus as never) ?? 'Draft') : null,
        notes: body.notes ? String(body.notes) : null,
        workNotes: body.workNotes ? String(body.workNotes) : null,
        adminNotes: body.adminNotes ? String(body.adminNotes) : null,
        internalNotes: body.internalNotes ? String(body.internalNotes) : null,
        revisionCount: body.revisionCount !== undefined ? Number(body.revisionCount) : 0,
        dueDate: body.dueDate ? new Date(String(body.dueDate)) : null,
      },
    });
    return ok(toApp(invoice), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to create invoice.', 500);
  }
}
