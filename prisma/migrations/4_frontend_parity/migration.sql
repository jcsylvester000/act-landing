-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "clientResponseNote" TEXT,
ADD COLUMN     "operatorName" TEXT,
ADD COLUMN     "respondedAt" TIMESTAMP(3),
ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "operatorId" TEXT,
ADD COLUMN     "operatorName" TEXT,
ADD COLUMN     "preferredTechnicianName" TEXT,
ADD COLUMN     "review" TEXT,
ADD COLUMN     "technicianId" TEXT,
ADD COLUMN     "technicianName" TEXT;

