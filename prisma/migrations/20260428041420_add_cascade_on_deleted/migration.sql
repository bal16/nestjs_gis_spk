-- DropForeignKey
ALTER TABLE "assessments" DROP CONSTRAINT "assessments_building_id_fkey";

-- DropForeignKey
ALTER TABLE "saw_run_details" DROP CONSTRAINT "saw_run_details_assessmentId_fkey";

-- DropForeignKey
ALTER TABLE "saw_run_details" DROP CONSTRAINT "saw_run_details_building_id_fkey";

-- DropForeignKey
ALTER TABLE "saw_run_details" DROP CONSTRAINT "saw_run_details_run_id_fkey";

-- DropForeignKey
ALTER TABLE "weight_configs" DROP CONSTRAINT "weight_configs_sub_weight_from_fkey";

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saw_run_details" ADD CONSTRAINT "saw_run_details_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "saw_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saw_run_details" ADD CONSTRAINT "saw_run_details_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saw_run_details" ADD CONSTRAINT "saw_run_details_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "assessments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_configs" ADD CONSTRAINT "weight_configs_sub_weight_from_fkey" FOREIGN KEY ("sub_weight_from") REFERENCES "weight_configs"("key") ON DELETE CASCADE ON UPDATE CASCADE;
