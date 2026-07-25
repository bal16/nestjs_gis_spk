import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma.service';
import { type BatchUpdateWeightsDTO } from './dto/update-weights.dto';
import { BuildingService } from '../building/building.service';
import type { WeightConfiguration } from 'src/generated/prisma/client';
import type { BuildingWithAssessment } from 'src/common/type';
import { SawRunEntity } from './entities/saw-run.entity';
import { WeightConfigurationEntity } from './entities/weight-configuration.entity';

@Injectable()
export class DssService {
  constructor(
    private prisma: PrismaService,
    private readonly buildingService: BuildingService,
  ) {}

  async findAllResults(): Promise<SawRunEntity[]> {
    const runs = await this.prisma.sawRun.findMany({
      include: {
        sawRunDetails: {
          include: { building: true },
        },
      },
      orderBy: { executedAt: 'desc' },
    });

    return runs.map((r) => new SawRunEntity(r));
  }

  async getResultById(id: string): Promise<SawRunEntity | null> {
    const run = await this.prisma.sawRun.findUnique({
      where: { id },
      include: {
        sawRunDetails: {
          include: {
            building: true,
            assessment: true,
          },
        },
      },
    });

    return run ? new SawRunEntity(run) : null;
  }

  async getLastResult(): Promise<SawRunEntity | null> {
    const run = await this.prisma.sawRun.findFirst({
      include: {
        sawRunDetails: {
          include: {
            building: true,
            assessment: true,
          },
        },
      },
      orderBy: {
        executedAt: 'desc',
      },
    });

    return run ? new SawRunEntity(run) : null;
  }

  async getWeights(): Promise<WeightConfigurationEntity[]> {
    const weights = await this.prisma.weightConfiguration.findMany({
      where: { subWeightFrom: null },
      include: { subWeights: true },
    });

    return weights.map((w) => new WeightConfigurationEntity(w));
  }

  async updateWeights(dto: BatchUpdateWeightsDTO) {
    const totalWeights = dto.weights.reduce((sum, item) => sum + item.value, 0);

    if (Math.abs(totalWeights - 1) > 0.0001) {
      throw new BadRequestException(
        `Total bobot kriteria harus 1.0 (Sekarang: ${totalWeights})`,
      );
    }

    for (const item of dto.weights) {
      if (item.subWeights && item.subWeights.length > 0) {
        const totalSub = item.subWeights.reduce(
          (sum, sub) => sum + sub.value,
          0,
        );

        if (Math.abs(totalSub - 1) > 0.0001) {
          throw new BadRequestException(
            `Total sub-bobot untuk kriteria ${item.key} harus 1.0 (Sekarang: ${totalSub})`,
          );
        }
      }
    }

    return await this.prisma.$transaction(async (tx) => {
      for (const item of dto.weights) {
        await tx.weightConfiguration.update({
          where: { key: item.key },
          data: { value: item.value },
        });

        if (item.subWeights) {
          for (const sub of item.subWeights) {
            await tx.weightConfiguration.update({
              where: { key: sub.key },
              data: { value: sub.value },
            });
          }
        }
      }

      return true;
    });
  }

  async calculateAndSave() {
    const rawWeights = await this.getWeights();
    const alternatives = await this.buildingService.findAllWithAssessments();
    const assessmentMatrix = this.mapBuildingsToAssessment(alternatives);
    const weights = rawWeights.flatMap(
      (w: WeightConfiguration & { subWeights?: WeightConfiguration[] }) =>
        w.subWeights && w.subWeights.length > 0
          ? w.subWeights.map((sub) => ({
              key: sub.key,
              name: sub.name,
              value: w.value * sub.value,
              type: sub.type,
              subWeightFrom: w.key,
            }))
          : [
              {
                key: w.key,
                name: w.name,
                value: w.value,
                type: w.type,
                subWeightFrom: null as string | null,
              },
            ],
    );
    const normalizedMatrix = this.normalizeAlternatives(
      assessmentMatrix,
      weights,
    );
    const calculatedPreferences = this.calculatePreferences(
      normalizedMatrix,
      weights,
    );

    const totalBuildings = calculatedPreferences.length;
    const averageScore =
      calculatedPreferences.reduce((acc, curr) => acc + curr.preference, 0) /
      totalBuildings;

    await this.prisma.sawRun.create({
      data: {
        averageScore,
        totalBuildings,
        snapshotWeights: rawWeights as any, // Menyimpan bobot saat ini sebagai history
        executedAt: new Date(),
        sawRunDetails: {
          create: calculatedPreferences.map((result) => ({
            buildingId: result.id, // result.id dari building
            assessmentId: result.assessments[0].id, // Ambil ID assessment yang dipakai
            score: result.preference, // Hasil hitung SAW
            priority:
              result.preference > 0.8 ? 3 : result.preference > 0.5 ? 2 : 1,
            detail: {
              c1: result.c1 ?? 0,
              c21: result.c21 ?? 0,
              c22: result.c22 ?? 0,
              c23: result.c23 ?? 0,
              c3: result.c3 ?? 0,
              c4: result.c4 ?? 0,
              c5: result.c5 ?? 0,
            },
          })),
        },
      },
    });

    return true;
  }

  private mapBuildingsToAssessment(buildings: BuildingWithAssessment[]) {
    const currentYear = new Date().getFullYear();

    return buildings.flatMap((b) => {
      if (b.assessments.length === 0) return [];
      const assessment = b.assessments[0];

      return [
        {
          ...b,
          priority: b.priority ?? 0,
          c1: assessment.age,

          c21: assessment.structure,
          c22: assessment.architecture,
          c23: assessment.mep,

          c3: assessment.utility > 500 ? 3 : assessment.utility >= 100 ? 2 : 1,

          c4: assessment.damage,

          c5: (() => {
            if (!assessment.lastMaintenance) {
              return assessment.age;
            }

            const yearDiff =
              currentYear - new Date(assessment.lastMaintenance).getFullYear();

            return Math.max(0, yearDiff);
          })(),
        },
      ];
    });
  }

  private normalizeAlternatives(
    alternatives: ReturnType<typeof this.mapBuildingsToAssessment>,
    weights: WeightConfiguration[],
  ) {
    const bounds: Record<string, { max: number; min: number }> = {};
    weights.forEach((w) => {
      const values: number[] = alternatives.map(
        (a) => (a as Record<string, unknown>)[w.key] as number,
      );
      bounds[w.key] = {
        max: Math.max(...values),
        min: Math.min(...values),
      };
    });

    return alternatives.map((alt) => {
      const normalizedAlt = { ...alt };
      weights.forEach((w) => {
        const val = (alt as Record<string, unknown>)[w.key] as number;
        if (w.type === 'benefit') {
          normalizedAlt[w.key] =
            bounds[w.key].max !== 0 ? val / bounds[w.key].max : 0;
        } else {
          normalizedAlt[w.key] = val !== 0 ? bounds[w.key].min / val : 0;
        }
      });
      return normalizedAlt;
    });
  }

  private calculatePreferences(
    normalizedMatrix: ReturnType<typeof this.normalizeAlternatives>,
    weights: WeightConfiguration[],
  ) {
    return normalizedMatrix.map((alt) => {
      let preference = 0;
      weights.forEach((weight) => {
        preference += alt[weight.key] * weight.value;
      });
      return { ...alt, preference };
    });
  }

  async deleteRun(id: string) {
    await this.prisma.sawRun.delete({
      where: {
        id,
      },
    });

    return true;
  }

  async deleteRunDetail(id: string) {
    await this.prisma.sawRunDetail.delete({
      where: {
        id,
      },
    });

    return true;
  }
}
