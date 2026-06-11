import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' }, include: { job: { select: { serviceType: true, city: true } } } });
    return ok(toApp(reviews));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load reviews.', 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { jobId, clientId, rating } = body;
    if (!jobId || !clientId || rating === undefined) return fail('jobId, clientId, and rating are required.');
    const r = Math.round(Number(rating));
    if (r < 1 || r > 5) return fail('rating must be 1–5.');

    const review = await prisma.review.create({
      data: {
        jobId: String(jobId), clientId: String(clientId), rating: r,
        comment: body.comment ? String(body.comment) : null,
        technicianId: body.technicianId ? String(body.technicianId) : null,
      },
    });
    await prisma.job.update({ where: { id: String(jobId) }, data: { rating: r } });

    // keep technician averageRating in sync
    if (body.technicianId) {
      const techId = String(body.technicianId);
      const agg = await prisma.review.aggregate({ where: { technicianId: techId }, _avg: { rating: true }, _count: true });
      await prisma.technician.update({
        where: { id: techId },
        data: { averageRating: Number((agg._avg.rating ?? r).toFixed(2)) },
      });
    }
    return ok(toApp(review), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to create review.', 500);
  }
}
