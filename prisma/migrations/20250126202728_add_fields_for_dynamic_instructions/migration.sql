/*
  Warnings:

  - You are about to drop the column `message` on the `ScheduledMessage` table. All the data in the column will be lost.
  - Added the required column `instruction` to the `ScheduledMessage` table without a default value. This is not possible if the table is not empty.

*/

DELETE FROM "User";

DELETE FROM "ScheduledMessage";

-- AlterTable
ALTER TABLE "ScheduledMessage" DROP COLUMN "message",
ADD COLUMN     "instruction" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "onboarding" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Config_key_key" ON "Config"("key");
