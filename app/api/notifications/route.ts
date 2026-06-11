import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return fail('userId query param is required.');
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return ok(toApp(notifications));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load notifications.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { userId, message } = body;
    if (!userId || !message) return fail('userId and message are required.');
    const notification = await prisma.notification.create({
      data: {
        ...(body.id ? { id: String(body.id) } : {}),
        userId: String(userId),
        jobId: body.jobId ? String(body.jobId) : null,
        message: String(message),
        type: (body.type as never) ?? 'info',
      },
    });
    return ok(toApp(notification), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to create notification.', 500);
  }
}

// PATCH /api/notifications — mark read: { ids: string[] } or { userId } for all
export async function PATCH(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    if (Array.isArray(body.ids)) {
      const r = await prisma.notification.updateMany({ where: { id: { in: body.ids.map(String) } }, data: { read: true } });
      return ok({ updated: r.count });
    }
    if (body.userId) {
      const r = await prisma.notification.updateMany({ where: { userId: String(body.userId), read: false }, data: { read: true } });
      return ok({ updated: r.count });
    }
    return fail('Provide ids[] or userId.');
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to update notifications.', 500);
  }
}
