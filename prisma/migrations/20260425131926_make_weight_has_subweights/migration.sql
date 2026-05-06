-- AlterTable
ALTER TABLE "weight_configs" ADD COLUMN     "sub_weight_from" TEXT;

-- AddForeignKey
ALTER TABLE "weight_configs" ADD CONSTRAINT "weight_configs_sub_weight_from_fkey" FOREIGN KEY ("sub_weight_from") REFERENCES "weight_configs"("key") ON DELETE SET NULL ON UPDATE CASCADE;
