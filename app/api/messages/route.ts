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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { jobId, senderId, senderRole, body: text } = body;
    if (!jobId || !senderId || !senderRole || !text) {
      return fail('jobId, senderId, senderRole, and body are required.');
    }
    const message = await prisma.message.create({
      data: {
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
