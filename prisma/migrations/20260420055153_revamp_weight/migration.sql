/*
  Warnings:

  - Added the required column `type` to the `weight_configs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assessments" ADD COLUMN     "last_maintenance" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "weight_configs" ADD COLUMN     "type" TEXT NOT NULL;
