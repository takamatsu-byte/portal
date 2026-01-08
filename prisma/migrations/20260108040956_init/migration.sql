/*
  Warnings:

  - You are about to drop the column `actualRent` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `purchaseCostTotal` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the `CostItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `ownerId` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `propertyAddress` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'ARCHIVED');

-- DropForeignKey
ALTER TABLE "CostItem" DROP CONSTRAINT "CostItem_projectId_fkey";

-- DropIndex
DROP INDEX "Project_code_key";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "actualRent",
DROP COLUMN "code",
DROP COLUMN "location",
DROP COLUMN "purchaseCostTotal",
ADD COLUMN     "acquisitionCost" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "agentRent" INTEGER,
ADD COLUMN     "expectedYieldBp" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "projectTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "propertyAddress" TEXT NOT NULL,
ADD COLUMN     "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "surfaceYieldBp" INTEGER,
ADD COLUMN     "title" TEXT NOT NULL;

-- DropTable
DROP TABLE "CostItem";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "Project_ownerId_idx" ON "Project"("ownerId");

-- CreateIndex
CREATE INDEX "Project_status_idx" ON "Project"("status");

-- CreateIndex
CREATE INDEX "Project_propertyAddress_idx" ON "Project"("propertyAddress");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
