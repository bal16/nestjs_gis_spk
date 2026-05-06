/*
  Warnings:

  - Added the required column `assessmentId` to the `saw_run_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "saw_run_details" ADD COLUMN     "assessmentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "saw_run_details" ADD CONSTRAINT "saw_run_details_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
