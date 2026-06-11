-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('Residential', 'Commercial');

-- CreateEnum
CREATE TYPE "ClientFollowUpStatus" AS ENUM ('On track', 'Due soon', 'Overdue', 'No response', 'Converted');

-- CreateEnum
CREATE TYPE "LeadSource" AS ENUM ('Referral', 'Organic', 'Facebook', 'Walk-in', 'Other');

-- AlterEnum
BEGIN;
CREATE TYPE "SkillLevel_new" AS ENUM ('Junior', 'Senior', 'Lead');
ALTER TABLE "public"."technicians" ALTER COLUMN "skillLevel" DROP DEFAULT;
ALTER TABLE "technicians" ALTER COLUMN "skillLevel" TYPE "SkillLevel_new" USING ("skillLevel"::text::"SkillLevel_new");
ALTER TYPE "SkillLevel" RENAME TO "SkillLevel_old";
ALTER TYPE "SkillLevel_new" RENAME TO "SkillLevel";
DROP TYPE "public"."SkillLevel_old";
ALTER TABLE "technicians" ALTER COLUMN "skillLevel" SET DEFAULT 'Junior';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TechnicianType_new" AS ENUM ('Inhouse', 'Outsource');
ALTER TABLE "public"."technicians" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "technicians" ALTER COLUMN "type" TYPE "TechnicianType_new" USING ("type"::text::"TechnicianType_new");
ALTER TYPE "TechnicianType" RENAME TO "TechnicianType_old";
ALTER TYPE "TechnicianType_new" RENAME TO "TechnicianType";
DROP TYPE "public"."TechnicianType_old";
ALTER TABLE "technicians" ALTER COLUMN "type" SET DEFAULT 'Outsource';
COMMIT;

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "acUnits" INTEGER,
ADD COLUMN     "assignedCities" "CoverageCity"[],
ADD COLUMN     "clientType" "ClientType",
ADD COLUMN     "lastServiceDate" DATE,
ADD COLUMN     "operatorStatus" TEXT,
DROP COLUMN "leadSource",
ADD COLUMN     "leadSource" "LeadSource",
DROP COLUMN "followUpStatus",
ADD COLUMN     "followUpStatus" "ClientFollowUpStatus";

-- AlterTable
ALTER TABLE "service_catalog" ADD COLUMN     "pricePerUnitCassette" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "technicians" ALTER COLUMN "type" SET DEFAULT 'Outsource';

