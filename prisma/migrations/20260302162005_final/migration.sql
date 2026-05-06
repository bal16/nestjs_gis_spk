/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" CHAR(20) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "score" DOUBLE PRECISION,
    "priority" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assessments" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "structure" INTEGER NOT NULL,
    "architecture" INTEGER NOT NULL,
    "mep" INTEGER NOT NULL,
    "utility" INTEGER NOT NULL,
    "damage" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saw_runs" (
    "id" TEXT NOT NULL,
    "run_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "avg_score" DOUBLE PRECISION,
    "total_buildings" INTEGER,
    "snapshot_weights" JSONB,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saw_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saw_run_details" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "priority" INTEGER NOT NULL,
    "detail" JSONB,

    CONSTRAINT "saw_run_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_configs" (
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "weight_configs_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_name_key" ON "users"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_code_key" ON "buildings"("code");

-- CreateIndex
CREATE UNIQUE INDEX "assessments_building_id_key" ON "assessments"("building_id");

-- AddForeignKey
ALTER TABLE "assessments" ADD CONSTRAINT "assessments_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saw_run_details" ADD CONSTRAINT "saw_run_details_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "saw_runs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saw_run_details" ADD CONSTRAINT "saw_run_details_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
