import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const messages = await prisma.message.findMany({
      where: jobId ? { jobId } : undefined,
      orderBy: { createdAt: 'asc' },
    });
    return ok(toApp(messages));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load messages.', 500);
  }
}

// PATCH — { action: 'markRead', jobId, userId } | { action: 'calendarResponse', messageId, accepted, userId }
export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (body.action === 'markRead' && body.jobId && body.userId) {
      const msgs = await prisma.message.findMany({ where: { jobId: String(body.jobId) } });
      const uid = String(body.userId);
      let updated = 0;
      for (const m of msgs) {
        if (!m.readBy.includes(uid)) {
          await prisma.message.update({ where: { id: m.id }, data: { readBy: [...m.readBy, uid] } });
          updated++;
        }
      }
      return ok({ updated });
    }
    if (body.action === 'calendarResponse' && body.messageId) {
      const m = await prisma.message.findUnique({ where: { id: String(body.messageId) } });
      if (!m) return fail('Message not found.', 404);
      const meta = { ...(m.meta as Record<string, unknown> ?? {}), accepted: Boolean(body.accepted) };
      const readBy = body.userId && !m.readBy.includes(String(body.userId)) ? [...m.readBy, String(body.userId)] : m.readBy;
      const updated = await prisma.message.update({ where: { id: m.id }, data: { meta: meta as never, readBy } });
      return ok(toApp(updated));
    }
    return fail('Unknown action.');
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to update messages.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { jobId, senderId, senderRole, body: text } = body;
    if (!jobId || !senderId || !senderRole || !text) {
      return fail('jobId, senderId, senderRole, and body are required.');
    }
    const message = await prisma.message.create({
      data: {
        ...(body.id ? { id: String(body.id) } : {}),
        jobId: String(jobId),
        senderId: String(senderId),
        senderRole: senderRole as never,
        body: String(text),
        kind: body.kind ? String(body.kind) : 'text',
        meta: (body.meta as never) ?? undefined,
        readBy: [String(senderId)],
      },
    });
    return ok(toApp(message), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to send message.', 500);
  }
}
