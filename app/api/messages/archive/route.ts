// ─── 7-DAY CHAT RETENTION JOB ─────────────────────────────────────────────────
// POST /api/messages/archive — moves live messages older than 7 days into
// chat_archives (JSON payload per job thread), then deletes them from the
// live messages table. Idempotent. Call from a scheduled task (Netlify
// scheduled function / cron) or on dashboard load.
// GET /api/messages/archive?clientId=&operatorId= — list archives.

import { prisma } from '@/lib/prisma';
import { ok, fail } from '@/lib/api';

const RETENTION_DAYS = 7;

type ArchivedMessage = {
  id: string; senderId: string; senderRole: string; senderName?: string;
  content: string; type: string; createdAt: string;
};

export async function POST() {
  try {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);
    const expired = await prisma.message.findMany({
      where: { createdAt: { lt: cutoff } },
      orderBy: { createdAt: 'asc' },
    });
    if (expired.length === 0) return ok({ archived: 0, threads: 0 });

    const byJob = new Map<string, typeof expired>();
    for (const m of expired) {
      if (!byJob.has(m.jobId)) byJob.set(m.jobId, []);
      byJob.get(m.jobId)!.push(m);
    }

    let threads = 0;
    for (const [jobId, msgs] of byJob) {
      const job = await prisma.job.findUnique({ where: { id: jobId }, include: { client: true } });
      const slim: ArchivedMessage[] = msgs.map(m => ({
        id: m.id, senderId: m.senderId, senderRole: m.senderRole,
        senderName: (m.meta as { senderName?: string } | null)?.senderName,
        content: m.body, type: m.kind, createdAt: m.createdAt.toISOString(),
      }));
      const existing = await prisma.chatArchive.findUnique({ where: { jobId } });
      if (existing) {
        const merged = [...(existing.payload as ArchivedMessage[]), ...slim]
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        await prisma.chatArchive.update({
          where: { jobId },
          data: {
            payload: merged as never,
            messageCount: merged.length,
            archivedAt: new Date(),
            fromDate: new Date(merged[0].createdAt),
            toDate: new Date(merged[merged.length - 1].createdAt),
          },
        });
      } else {
        await prisma.chatArchive.create({
          data: {
            jobId,
            clientId: job?.clientId ?? '',
            clientName: job ? `${job.client.firstName} ${job.client.lastName}` : 'Unknown',
            payload: slim as never,
            messageCount: slim.length,
            fromDate: new Date(slim[0].createdAt),
            toDate: new Date(slim[slim.length - 1].createdAt),
          },
        });
      }
      threads++;
    }

    await prisma.message.deleteMany({ where: { createdAt: { lt: cutoff } } });
    return ok({ archived: expired.length, threads });
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Archive job failed.', 500);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('clientId');
    const operatorId = searchParams.get('operatorId');
    const archives = await prisma.chatArchive.findMany({
      where: {
        ...(clientId ? { clientId } : {}),
        ...(operatorId ? { operatorId } : {}),
      },
      orderBy: { archivedAt: 'desc' },
    });
    return ok(archives);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load archives.', 500);
  }
}
