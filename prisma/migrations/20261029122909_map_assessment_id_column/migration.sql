-- Menyelaraskan nama kolom dengan @map("assessment_id") pada model SawRunDetail.
-- Memakai RENAME (bukan DROP + ADD) agar data lama tetap aman dan migrasi
-- tetap bisa dijalankan pada tabel yang sudah berisi data.
ALTER TABLE "saw_run_details" RENAME COLUMN "assessmentId" TO "assessment_id";

-- Rename constraint agar konsisten dengan nama kolom baru.
ALTER TABLE "saw_run_details" RENAME CONSTRAINT "saw_run_details_assessmentId_fkey" TO "saw_run_details_assessment_id_fkey";
