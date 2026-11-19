# Design: Lengkapi Backend P2 (#25, #26)

## Intent

Issue #26 minta `GET /buildings` mengembalikan `assessmentCount` per gedung (0 bila belum ada)
tanpa mengirim array `assessments` penuh. PR #28 sudah mengganti `assessments: true` dengan
`_count`, tapi `BuildingEntity` tidak punya field `assessmentCount`, sehingga yang terkirim
adalah `_count: { assessments: n }`. Issue #25 sudah terpenuhi di kode (DTO opsional, Prisma
nullable); perlu test regresi agar tidak kembali.

## Goals

- `GET /buildings` mengembalikan `assessmentCount: number` dan tidak lagi mengembalikan
  `_count` atau array `assessments`.
- `GET /buildings/:code/assessments` tetap mengembalikan daftar lengkap.
- OpenAPI dan test mengikuti kontrak baru.
- Payload tanpa `lastMaintenance` tervalidasi benar-benar lolos (regresi #25).

## Non-goals

- Tidak mengubah logika DSS / guard #24.
- Tidak menyentuh frontend (termasuk worktree frontend yang sedang dirty).
- Tidak mengubah skema Prisma atau migrasi.

## Approaches

1. **Mapping di `BuildingEntity` (pilihan).** Konstruktor menerima `_count` dari Prisma,
   menyimpannya sebagai `assessmentCount`, lalu membuang `_count`. Konsisten dengan pola
   konstruktor yang sudah memetakan `assessments` ke `AssessmentEntity`. Satu tempat untuk
   semua pemanggil entity.
2. Mapping di `BuildingService.findAll()`. Lebih eksplisit di query, tapi menyebarkan
   pengetahuan tentang bentuk Prisma ke service dan entity tetap bisa menerima `_count`
   mentah dari jalur lain.
3. Flatten di controller/response. Paling lambat dan bocor ke lapisan transport.

## Design

- `BuildingEntity`: tambah `assessmentCount?: number`; konstruktor terima
  `Partial<BuildingEntity> & { _count?: { assessments: number } }`, destructure `_count`,
  `Object.assign` sisa fields, lalu set `assessmentCount` bila `_count` ada.
- `BuildingService.findAll()` tidak berubah (sudah memakai `_count`).
- Test unit: `findAll()` menghasilkan `assessmentCount`, tanpa `_count`/`assessments`,
  termasuk kasus 0.
- Test e2e: `GET /buildings` untuk gedung uji bernilai 0 sebelum assessment dibuat, lalu
  bertambah setelah assessment dibuat.
- Test DTO #25: `validate()` terhadap payload tanpa `lastMaintenance` menghasilkan 0 error.
- OpenAPI: deskripsi & contoh `GET /buildings`, dan schema `Building` diberi
  `assessmentCount` (opsional, karena endpoint detail tidak mengirimnya).

## Constraints

- Backend submodule sedang clean di `89876ce`; kerjaan dilakukan di branch baru.
- E2E belum bisa dijalankan lokal tanpa DB uji; teks test tetap ditulis agar jalan di CI.
- Gitlink superproject masih menunjuk commit lama, perlu diputuskan terpisah apakah ikut
  di-commit.
