/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('REVENUE', 'RESALE', 'BROKERAGE');

-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "Project" DROP CONSTRAINT "Project_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "Project_ownerId_idx";

-- DropIndex
DROP INDEX "Project_propertyAddress_idx";

-- DropIndex
DROP INDEX "Project_status_idx";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "ownerId",
DROP COLUMN "status",
DROP COLUMN "title",
ADD COLUMN     "actualSalePrice" DOUBLE PRECISION,
ADD COLUMN     "buildingAge" TEXT,
ADD COLUMN     "buildingFloors" TEXT,
ADD COLUMN     "buildingHouseNumber" TEXT,
ADD COLUMN     "buildingOwnerAddress" TEXT,
ADD COLUMN     "buildingOwnerName" TEXT,
ADD COLUMN     "buildingStructure" TEXT,
ADD COLUMN     "buildingType" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "contractDate" TEXT,
ADD COLUMN     "googleDriveFolderId" TEXT,
ADD COLUMN     "landArea" DOUBLE PRECISION,
ADD COLUMN     "landCategory" TEXT,
ADD COLUMN     "landLotNumber" TEXT,
ADD COLUMN     "landOwnerAddress" TEXT,
ADD COLUMN     "landOwnerName" TEXT,
ADD COLUMN     "settlementDate" TEXT,
ADD COLUMN     "type" "ProjectType" NOT NULL DEFAULT 'REVENUE',
ALTER COLUMN "expectedRent" DROP NOT NULL,
ALTER COLUMN "expectedRent" DROP DEFAULT,
ALTER COLUMN "expectedRent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "propertyPrice" DROP NOT NULL,
ALTER COLUMN "propertyPrice" DROP DEFAULT,
ALTER COLUMN "propertyPrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "expectedSalePrice" DROP NOT NULL,
ALTER COLUMN "expectedSalePrice" DROP DEFAULT,
ALTER COLUMN "expectedSalePrice" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "acquisitionCost" DROP NOT NULL,
ALTER COLUMN "acquisitionCost" DROP DEFAULT,
ALTER COLUMN "acquisitionCost" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "agentRent" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "expectedYieldBp" DROP NOT NULL,
ALTER COLUMN "expectedYieldBp" DROP DEFAULT,
ALTER COLUMN "expectedYieldBp" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "projectTotal" DROP NOT NULL,
ALTER COLUMN "projectTotal" DROP DEFAULT,
ALTER COLUMN "projectTotal" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "propertyAddress" DROP NOT NULL,
ALTER COLUMN "surfaceYieldBp" SET DATA TYPE DOUBLE PRECISION;

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "User";

-- DropTable
DROP TABLE "VerificationToken";

-- DropEnum
DROP TYPE "ProjectStatus";

-- CreateTable
CREATE TABLE "ResaleProject" (
    "id" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL DEFAULT 'RESALE',
    "code" TEXT,
    "propertyAddress" TEXT,
    "propertyPrice" DOUBLE PRECISION,
    "acquisitionCost" DOUBLE PRECISION,
    "projectTotal" DOUBLE PRECISION,
    "expectedSalePrice" DOUBLE PRECISION,
    "googleDriveFolderId" TEXT,
    "landLotNumber" TEXT,
    "landCategory" TEXT,
    "landArea" DOUBLE PRECISION,
    "landOwnerAddress" TEXT,
    "landOwnerName" TEXT,
    "buildingHouseNumber" TEXT,
    "buildingType" TEXT,
    "buildingStructure" TEXT,
    "buildingFloors" TEXT,
    "buildingAge" TEXT,
    "buildingOwnerAddress" TEXT,
    "buildingOwnerName" TEXT,
    "contractDate" TEXT,
    "settlementDate" TEXT,
    "actualSalePrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResaleProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerageProject" (
    "id" TEXT NOT NULL,
    "type" "ProjectType" NOT NULL DEFAULT 'BROKERAGE',
    "code" TEXT,
    "propertyAddress" TEXT,
    "propertyPrice" DOUBLE PRECISION,
    "acquisitionCost" DOUBLE PRECISION,
    "projectTotal" DOUBLE PRECISION,
    "sales" DOUBLE PRECISION,
    "contractDate" TEXT,
    "settlementDate" TEXT,
    "googleDriveFolderId" TEXT,
    "landLotNumber" TEXT,
    "landCategory" TEXT,
    "landArea" DOUBLE PRECISION,
    "landOwnerAddress" TEXT,
    "landOwnerName" TEXT,
    "buildingHouseNumber" TEXT,
    "buildingType" TEXT,
    "buildingStructure" TEXT,
    "buildingFloors" TEXT,
    "buildingAge" TEXT,
    "buildingOwnerAddress" TEXT,
    "buildingOwnerName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrokerageProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpenseItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResaleExpenseItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ResaleExpenseItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrokerageExpenseItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "BrokerageExpenseItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExpenseItem" ADD CONSTRAINT "ExpenseItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResaleExpenseItem" ADD CONSTRAINT "ResaleExpenseItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "ResaleProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrokerageExpenseItem" ADD CONSTRAINT "BrokerageExpenseItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "BrokerageProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;
