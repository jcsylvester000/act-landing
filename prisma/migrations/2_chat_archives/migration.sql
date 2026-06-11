-- CreateTable
CREATE TABLE "chat_archives" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "operatorId" TEXT,
    "operatorName" TEXT,
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromDate" TIMESTAMP(3) NOT NULL,
    "toDate" TIMESTAMP(3) NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,

    CONSTRAINT "chat_archives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chat_archives_jobId_key" ON "chat_archives"("jobId");

-- CreateIndex
CREATE INDEX "chat_archives_clientId_idx" ON "chat_archives"("clientId");

