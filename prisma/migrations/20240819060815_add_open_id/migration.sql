/*
  Warnings:

  - You are about to drop the column `partyUID` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[openId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_partyUID_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "partyUID",
ADD COLUMN     "openId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_openId_key" ON "User"("openId");
