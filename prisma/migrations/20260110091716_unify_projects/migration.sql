/*
  Warnings:

  - You are about to drop the column `type` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `BrokerageExpenseItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BrokerageProject` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResaleExpenseItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResaleProject` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('PROSPECT', 'REVENUE', 'RESALE', 'BROKERAGE');

-- DropForeignKey
ALTER TABLE "BrokerageExpenseItem" DROP CONSTRAINT "BrokerageExpenseItem_projectId_fkey";

-- DropForeignKey
ALTER TABLE "ResaleExpenseItem" DROP CONSTRAINT "ResaleExpenseItem_projectId_fkey";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "type",
ADD COLUMN     "brokerageSales" DOUBLE PRECISION,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'PROSPECT';

-- DropTable
DROP TABLE "BrokerageExpenseItem";

-- DropTable
DROP TABLE "BrokerageProject";

-- DropTable
DROP TABLE "ResaleExpenseItem";

-- DropTable
DROP TABLE "ResaleProject";

-- DropEnum
DROP TYPE "ProjectType";
