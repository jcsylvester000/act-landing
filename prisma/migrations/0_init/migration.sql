-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('client', 'operator', 'admin');

-- CreateEnum
CREATE TYPE "CoverageCity" AS ENUM ('Biñan', 'San Pedro', 'Sta. Rosa', 'Cabuyao', 'Muntinlupa', 'Carmona', 'GMA Cavite');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('Basic Cleaning', 'Deep Clean / Chemical Wash', 'AC Installation', 'Repair & Diagnostics', 'Refrigerant Recharge');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('Pending', 'Awaiting Payment', 'Confirmed', 'Active', 'Completed', 'Cancelled');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Unpaid', 'Awaiting Confirmation', 'Reservation paid', 'Fully paid', 'Refunded');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('GCash', 'Cash', 'Bank Transfer', 'Check');

-- CreateEnum
CREATE TYPE "TimeSlot" AS ENUM ('AM', 'PM', 'Flexible');

-- CreateEnum
CREATE TYPE "TechnicianType" AS ENUM ('Inhouse', 'Outsourced');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('Junior', 'Senior', 'Master');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('Assigned', 'Accepted', 'Declined', 'Reassigned', 'Completed');

-- CreateEnum
CREATE TYPE "FollowUpStatus" AS ENUM ('Due', 'Contacted', 'Scheduled', 'Converted', 'Dismissed');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('info', 'success', 'warning', 'error');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('Draft', 'Sent', 'Viewed by Client', 'Accepted', 'Revision Requested', 'Cancelled by Client');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('Draft', 'Submitted to Admin', 'Admin Approved', 'Admin Rejected', 'Sent to Client', 'Paid', 'Overdue', 'Disputed');

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'client',
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" "CoverageCity",
    "leadSource" TEXT,
    "preferredTechnicianId" TEXT,
    "nextDueDate" TIMESTAMP(3),
    "followUpStatus" "FollowUpStatus",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "TechnicianType" NOT NULL DEFAULT 'Outsourced',
    "skillLevel" "SkillLevel" NOT NULL DEFAULT 'Junior',
    "coverageCities" "CoverageCity"[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "averageRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "totalJobsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_catalog" (
    "id" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pricePerUnitWindow" DECIMAL(10,2),
    "pricePerUnitSplit" DECIMAL(10,2),
    "reservationFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "requiresQuote" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_catalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "acType" TEXT NOT NULL,
    "numberOfUnits" INTEGER NOT NULL DEFAULT 1,
    "serviceAddress" TEXT NOT NULL,
    "city" "CoverageCity" NOT NULL,
    "preferredDate" DATE NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL DEFAULT 'AM',
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "customPrice" DECIMAL(10,2),
    "requiresQuote" BOOLEAN NOT NULL DEFAULT false,
    "reservationFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balanceDue" DECIMAL(10,2) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'Unpaid',
    "preferredPaymentMethod" "PaymentMethod",
    "status" "JobStatus" NOT NULL DEFAULT 'Pending',
    "specialInstructions" TEXT,
    "techFieldNotes" TEXT,
    "cancelReason" TEXT,
    "isAdminCreated" BOOLEAN NOT NULL DEFAULT false,
    "preferredTechnicianId" TEXT,
    "rating" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_assignments" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "assignedById" TEXT,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'Assigned',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "job_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technician_schedule" (
    "id" TEXT NOT NULL,
    "technicianId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeSlot" "TimeSlot" NOT NULL,
    "jobId" TEXT,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "technician_schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "follow_ups" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "jobId" TEXT,
    "dueDate" DATE NOT NULL,
    "status" "FollowUpStatus" NOT NULL DEFAULT 'Due',
    "channel" TEXT,
    "note" TEXT,
    "contactedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "follow_ups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_history" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "technicianId" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL,
    "unitsServiced" INTEGER NOT NULL,
    "amountPaid" DECIMAL(10,2) NOT NULL,
    "workNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobId" TEXT,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "technicianId" TEXT,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "operatorId" TEXT,
    "technicianName" TEXT,
    "lineItems" JSONB NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "reservationFeePaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    "amountDue" DECIMAL(10,2) NOT NULL,
    "amountPaidAtClose" DECIMAL(10,2),
    "invoiceStatus" "InvoiceStatus",
    "billingStatus" "BillingStatus",
    "paymentMethod" "PaymentMethod",
    "receiptNumber" TEXT,
    "checkNumber" TEXT,
    "revisionCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "workNotes" TEXT,
    "adminNotes" TEXT,
    "internalNotes" TEXT,
    "dueDate" DATE,
    "sentAt" TIMESTAMP(3),
    "sentToClientAt" TIMESTAMP(3),
    "adminReviewedAt" TIMESTAMP(3),
    "revisedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderRole" "Role" NOT NULL,
    "body" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'text',
    "meta" JSONB,
    "readBy" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_role_idx" ON "clients"("role");

-- CreateIndex
CREATE UNIQUE INDEX "service_catalog_serviceType_key" ON "service_catalog"("serviceType");

-- CreateIndex
CREATE INDEX "jobs_clientId_status_idx" ON "jobs"("clientId", "status");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "jobs_preferredDate_idx" ON "jobs"("preferredDate");

-- CreateIndex
CREATE INDEX "job_assignments_jobId_idx" ON "job_assignments"("jobId");

-- CreateIndex
CREATE INDEX "job_assignments_technicianId_idx" ON "job_assignments"("technicianId");

-- CreateIndex
CREATE INDEX "technician_schedule_date_idx" ON "technician_schedule"("date");

-- CreateIndex
CREATE UNIQUE INDEX "technician_schedule_technicianId_date_timeSlot_key" ON "technician_schedule"("technicianId", "date", "timeSlot");

-- CreateIndex
CREATE INDEX "follow_ups_status_dueDate_idx" ON "follow_ups"("status", "dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "service_history_jobId_key" ON "service_history"("jobId");

-- CreateIndex
CREATE INDEX "service_history_clientId_completedAt_idx" ON "service_history"("clientId", "completedAt");

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_jobId_key" ON "reviews"("jobId");

-- CreateIndex
CREATE INDEX "reviews_rating_idx" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "invoices_jobId_idx" ON "invoices"("jobId");

-- CreateIndex
CREATE INDEX "invoices_kind_idx" ON "invoices"("kind");

-- CreateIndex
CREATE INDEX "invoices_billingStatus_idx" ON "invoices"("billingStatus");

-- CreateIndex
CREATE INDEX "messages_jobId_createdAt_idx" ON "messages"("jobId", "createdAt");

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_preferredTechnicianId_fkey" FOREIGN KEY ("preferredTechnicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_assignments" ADD CONSTRAINT "job_assignments_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_assignments" ADD CONSTRAINT "job_assignments_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technician_schedule" ADD CONSTRAINT "technician_schedule_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "follow_ups" ADD CONSTRAINT "follow_ups_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_history" ADD CONSTRAINT "service_history_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "technicians"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

