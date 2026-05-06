import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '../../src/generated/prisma/client';
import { HashService } from '../../src/auth/hash.service';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

// --- HELPER FUNCTIONS FOR MAPPING STRING TO INT ---
function mapPriority(priority: string): number {
  if (priority === 'Prioritas Rendah') return 1;
  if (priority === 'Prioritas Sedang') return 2;
  if (priority === 'Prioritas Tinggi') return 3;
  return 0;
}

function mapCondition(condition: string): number {
  if (condition === 'Baik') return 1;
  if (condition === 'Rusak Ringan') return 2;
  if (condition === 'Rusak Berat') return 3;
  return 1;
}

function mapLevel(level: string): number {
  if (level === 'Rendah') return 1;
  if (level === 'Sedang') return 2;
  if (level === 'Tinggi') return 3;
  return 1;
}

function mapUtility(level: string): number {
  if (level === 'Rendah') return 50;
  if (level === 'Sedang') return 200;
  if (level === 'Tinggi') return 600;
  return 50;
}

// tambahkan last maintenance
// --- REFERENCE DATA ---
const buildingsData = [
  {
    id: 1,
    code: 'E1',
    name: 'Gedung E1',
    location: { lng: 110.40129390382897, lat: -7.051282471950054 },
    score: 88.5,
    priority: 'Prioritas Tinggi' as const,
    criterias: {
      age: 20,
      structure: 'Rusak Ringan' as const,
      architecture: 'Rusak Berat' as const,
      MEP: 'Rusak Ringan' as const,
      utility: 'Tinggi' as const,
      damage: 'Tinggi' as const,
      lastMaintenance: new Date('2022-01-15'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 2,
    code: 'PENGHUBUNG',
    name: 'Gedung Penghubung',
    location: { lng: 110.40111687803346, lat: -7.051221247727476 },
    score: 55.0,
    priority: 'Prioritas Rendah' as const,
    criterias: {
      age: 12,
      structure: 'Baik' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Baik' as const,
      utility: 'Sedang' as const,
      damage: 'Rendah' as const,
      lastMaintenance: new Date('2023-03-10'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 3,
    code: 'E2',
    name: 'Gedung E2',
    location: { lng: 110.40131402039664, lat: -7.05081131141996 },
    score: 72.8,
    priority: 'Prioritas Sedang' as const,
    criterias: {
      age: 18,
      structure: 'Baik' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Rusak Ringan' as const,
      utility: 'Tinggi' as const,
      damage: 'Sedang' as const,
      lastMaintenance: new Date('2021-11-05'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 4,
    code: 'E11',
    name: 'Gedung E11',
    location: { lng: 110.40143474288514, lat: -7.050563134355567 },
    score: 91.0,
    priority: 'Prioritas Tinggi' as const,
    criterias: {
      age: 25,
      structure: 'Rusak Berat' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Rusak Berat' as const,
      utility: 'Tinggi' as const,
      damage: 'Tinggi' as const,
      lastMaintenance: new Date('2020-06-20'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 5,
    code: 'DEKANAT',
    name: 'Gedung Dekanat FT UNNES',
    location: { lng: 110.4018771804195, lat: -7.051752672742136 },
    score: 35.5,
    priority: 'Prioritas Rendah' as const,
    criterias: {
      age: 7,
      structure: 'Baik' as const,
      architecture: 'Baik' as const,
      MEP: 'Baik' as const,
      utility: 'Tinggi' as const,
      damage: 'Rendah' as const,
      lastMaintenance: new Date('2023-01-25'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 6,
    code: 'E12',
    name: 'Gedung E12',
    location: { lng: 110.40212655430308, lat: -7.051392418571761 },
    score: 68.0,
    priority: 'Prioritas Sedang' as const,
    criterias: {
      age: 10,
      structure: 'Baik' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Baik' as const,
      utility: 'Sedang' as const,
      damage: 'Sedang' as const,
      lastMaintenance: new Date('2022-08-30'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 7,
    code: 'E5',
    name: 'Gedung E5',
    location: { lng: 110.40218588115334, lat: -7.052077001050474 },
    score: 77.2,
    priority: 'Prioritas Sedang' as const,
    criterias: {
      age: 16,
      structure: 'Rusak Ringan' as const,
      architecture: 'Baik' as const,
      MEP: 'Rusak Ringan' as const,
      utility: 'Sedang' as const,
      damage: 'Tinggi' as const,
      lastMaintenance: new Date('2021-12-15'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 8,
    code: 'E3',
    name: 'Gedung E3',
    location: { lng: 110.40226833542107, lat: -7.051696788455939 },
    score: 49.0,
    priority: 'Prioritas Rendah' as const,
    criterias: {
      age: 11,
      structure: 'Baik' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Baik' as const,
      utility: 'Sedang' as const,
      damage: 'Rendah' as const,
      lastMaintenance: new Date('2023-02-20'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 9,
    code: 'E4',
    name: 'Gedung E4',
    location: { lng: 110.40239503344249, lat: -7.051507181011816 },
    score: 82.0,
    priority: 'Prioritas Tinggi' as const,
    criterias: {
      age: 19,
      structure: 'Rusak Ringan' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Rusak Ringan' as const,
      utility: 'Tinggi' as const,
      damage: 'Tinggi' as const,
      lastMaintenance: new Date('2020-09-10'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 10,
    code: 'E6',
    name: 'Gedung E6',
    location: { lng: 110.40270272863769, lat: -7.051406389654468 },
    score: 63.5,
    priority: 'Prioritas Sedang' as const,
    criterias: {
      age: 13,
      structure: 'Baik' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Baik' as const,
      utility: 'Sedang' as const,
      damage: 'Sedang' as const,
      lastMaintenance: new Date('2022-05-18'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 11,
    code: 'E9',
    name: 'Gedung E9',
    location: { lng: 110.40244028273523, lat: -7.052309519360358 },
    score: 51.5,
    priority: 'Prioritas Rendah' as const,
    criterias: {
      age: 9,
      structure: 'Baik' as const,
      architecture: 'Baik' as const,
      MEP: 'Rusak Ringan' as const,
      utility: 'Rendah' as const,
      damage: 'Rendah' as const,
      lastMaintenance: new Date('2023-04-15'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 12,
    code: 'E8',
    name: 'Gedung E8',
    location: { lng: 110.4029973518131, lat: -7.05162194342453 },
    score: 79.0,
    priority: 'Prioritas Sedang' as const,
    criterias: {
      age: 15,
      structure: 'Rusak Ringan' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Baik' as const,
      utility: 'Tinggi' as const,
      damage: 'Sedang' as const,
      lastMaintenance: new Date('2021-10-05'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 13,
    code: 'E7',
    name: 'Gedung E7',
    location: { lng: 110.40296517453747, lat: -7.0524063187944686 },
    score: 95.0,
    priority: 'Prioritas Tinggi' as const,
    criterias: {
      age: 28,
      structure: 'Rusak Berat' as const,
      architecture: 'Rusak Berat' as const,
      MEP: 'Rusak Berat' as const,
      utility: 'Tinggi' as const,
      damage: 'Tinggi' as const,
      lastMaintenance: new Date('2019-05-30'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 14,
    code: 'PKM',
    name: 'Gedung PKM',
    location: { lng: 110.4030788005404, lat: -7.0519802015514825 },
    score: 84.3,
    priority: 'Prioritas Tinggi' as const,
    criterias: {
      age: 17,
      structure: 'Rusak Ringan' as const,
      architecture: 'Rusak Ringan' as const,
      MEP: 'Rusak Berat' as const,
      utility: 'Tinggi' as const,
      damage: 'Tinggi' as const,
      lastMaintenance: new Date('2020-11-25'), // Contoh tanggal maintenance terakhir
    },
  },
  {
    id: 15,
    code: 'E10',
    name: 'Gedung E10',
    location: { lng: 110.40355844304946, lat: -7.052649814185674 },
    score: 42.0,
    priority: 'Prioritas Rendah' as const,
    criterias: {
      age: 6,
      structure: 'Baik' as const,
      architecture: 'Baik' as const,
      MEP: 'Baik' as const,
      utility: 'Sedang' as const,
      damage: 'Rendah' as const,
      lastMaintenance: new Date('2023-03-05'), // Contoh tanggal maintenance terakhir
    },
  },
];

async function main() {
  console.log('Seeding Database...');

  // 0. Cleanup existing data (order matters due to foreign keys)
  await prisma.sawRunDetail.deleteMany();
  await prisma.sawRun.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.building.deleteMany();
  await prisma.weightConfiguration.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed 1 User
  const user = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: await new HashService().hash('admin123'),
      isAdmin: true,
    },
  });
  console.log(`Created user: ${user.email}`);

  // 2. Seed WeightConfigurations
  const weightsData = [
    // KRITERIA UTAMA (Level 1)
    {
      key: 'c1',
      name: 'Age',
      type: 'benefit',
      value: 0.15,
      subWeightFrom: null,
    },
    {
      key: 'c2',
      name: 'Physical Condition',
      type: 'benefit',
      value: 0.15,
      subWeightFrom: null,
    },
    {
      key: 'c3',
      name: 'Utility',
      type: 'benefit',
      value: 0.1,
      subWeightFrom: null,
    },
    {
      key: 'c4',
      name: 'Damage Severity',
      type: 'benefit',
      value: 0.4,
      subWeightFrom: null,
    },
    {
      key: 'c5',
      name: 'Last Maintenance',
      type: 'benefit',
      value: 0.2,
      subWeightFrom: null,
    },

    // SUB-KRITERIA (Level 2) - Merujuk ke 'c2'
    // Perhatikan: Total value di sini harus 1.0 (0.4 + 0.3 + 0.3)
    {
      key: 'c21',
      name: 'Structure',
      type: 'benefit',
      value: 0.4,
      subWeightFrom: 'c2',
    },
    {
      key: 'c22',
      name: 'Architecture',
      type: 'benefit',
      value: 0.3,
      subWeightFrom: 'c2',
    },
    {
      key: 'c23',
      name: 'MEP (Mechanical Electrical Plumbing)',
      type: 'benefit',
      value: 0.3,
      subWeightFrom: 'c2',
    },
  ];
  await prisma.weightConfiguration.createMany({ data: weightsData });
  console.log(`Created ${weightsData.length} weight configurations`);

  // 3. Seed Buildings & Assessments
  const totalScore = buildingsData.reduce((acc, curr) => acc + curr.score, 0);
  const avgScore = totalScore / buildingsData.length;

  // 4. Seed 1 SawRun
  const sawRun = await prisma.sawRun.create({
    data: {
      averageScore: avgScore,
      totalBuildings: buildingsData.length,
      snapshotWeights: weightsData, // Saving weights active at the time of the run
    },
  });

  let createdBuildingsCount = 0;
  for (const b of buildingsData) {
    const createdBuilding = await prisma.building.create({
      data: {
        code: b.code,
        name: b.name.substring(0, 20), // Schema enforces Char(20), substring to prevent errors
        latitude: b.location.lat,
        longitude: b.location.lng,
        score: b.score,
        priority: mapPriority(b.priority),
        assessments: {
          create: {
            age: b.criterias.age,
            structure: mapCondition(b.criterias.structure),
            architecture: mapCondition(b.criterias.architecture),
            mep: mapCondition(b.criterias.MEP),
            utility: mapUtility(b.criterias.utility),
            damage: mapLevel(b.criterias.damage),
          },
        },
      },
      include: {
        assessments: true,
      },
    });

    const createdAssessment = createdBuilding.assessments[0];
    if (!createdAssessment) {
      throw new Error(
        `Assessment was not created for building ${createdBuilding.code}`,
      );
    }

    const currentYear = new Date().getFullYear();
    const c1 = b.criterias.age > 20 ? 3 : b.criterias.age >= 10 ? 2 : 1;
    const c2 = Math.round(
      (mapCondition(b.criterias.structure) +
        mapCondition(b.criterias.architecture) +
        mapCondition(b.criterias.MEP)) /
        3,
    );
    const utilityVal = mapUtility(b.criterias.utility);
    const c3 = utilityVal > 500 ? 3 : utilityVal >= 100 ? 2 : 1;
    const c4 = mapLevel(b.criterias.damage);
    const yearDiff = currentYear - b.criterias.lastMaintenance.getFullYear();
    const c5 = yearDiff > 5 ? 3 : yearDiff >= 2 ? 2 : 1;

    await prisma.sawRunDetail.create({
      data: {
        sawRun: { connect: { id: sawRun.id } },
        building: { connect: { id: createdBuilding.id } },
        assessment: { connect: { id: createdAssessment.id } },
        score: b.score,
        priority: mapPriority(b.priority),
        detail: { c1, c2, c3, c4, c5 } as Prisma.InputJsonValue,
      },
    });

    createdBuildingsCount++;
  }
  console.log(
    `Created ${createdBuildingsCount} buildings with assessments & SawRunDetails`,
  );
  console.log('Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
