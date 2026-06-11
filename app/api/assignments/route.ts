import { prisma } from '@/lib/prisma';
import { ok, fail, toApp } from '@/lib/api';

// POST /api/assignments — assign/reassign a technician to a job
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const { jobId, technicianId } = body;
    if (!jobId || !technicianId) return fail('jobId and technicianId are required.');

    const [job, tech] = await Promise.all([
      prisma.job.findUnique({ where: { id: String(jobId) } }),
      prisma.technician.findUnique({ where: { id: String(technicianId) } }),
    ]);
    if (!job) return fail('Job not found.', 404);
    if (!tech) return fail('Technician not found.', 404);

    // mark any prior assignment as Reassigned
    await prisma.jobAssignment.updateMany({
      where: { jobId: String(jobId), status: { in: ['Assigned', 'Accepted'] } },
      data: { status: 'Reassigned' },
    });
    const assignment = await prisma.jobAssignment.create({
      data: {
        jobId: String(jobId), technicianId: String(technicianId),
        assignedById: body.assignedById ? String(body.assignedById) : null,
        notes: body.notes ? String(body.notes) : null,
      },
      include: { technician: true },
    });
    // notify client (parity with store)
    await prisma.notification.create({
      data: {
        userId: job.clientId, jobId: job.id, type: 'success',
        message: `${tech.fullName} has been assigned to your service on ${job.preferredDate.toISOString().split('T')[0]}. We'll message you with details!`,
      },
    });
    return ok(toApp(assignment), 201);
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to assign technician.', 500);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('jobId');
    const technicianId = searchParams.get('technicianId');
    const assignments = await prisma.jobAssignment.findMany({
      where: {
        ...(jobId ? { jobId } : {}),
        ...(technicianId ? { technicianId } : {}),
      },
      orderBy: { assignedAt: 'desc' },
      include: { technician: true },
    });
    return ok(toApp(assignments));
  } catch (e) {
    return fail(e instanceof Error ? e.message : 'Failed to load assignments.', 500);
  }
}
