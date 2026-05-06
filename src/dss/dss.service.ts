import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma.service';
import { type BatchUpdateWeightsDTO } from './dto/update-weights.dto';
import { BuildingService } from '../building/building.service';

@Injectable()
export class DssService {
  constructor(
    private prisma: PrismaService,
    private readonly buildingService: BuildingService,
  ) {}

  async findAllResults() {
    return this.prisma.sawRun.findMany({
      include: {
        sawRunDetails: {
          include: { building: true },
        },
      },
      orderBy: { executedAt: 'desc' },
    });
  }

  async getResultById(id: string) {
    return this.prisma.sawRun.findUnique({
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
  }
  async getLastResult() {
    return this.prisma.sawRun.findFirst({
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
  }

  // async findAllResults() {
  //   return this.prisma.building.findMany({
  //     include: {
  //       assessments: true,
  //       sawRunDetails: {
  //         orderBy: { sawRun: { executedAt: 'desc' } },
  //         take: 1,
  //       },
  //     },
  //   });
  // }

  getWeights() {
    return this.prisma.weightConfiguration.findMany({
      where: { subWeightFrom: null },
      include: { subWeights: true },
    });
  }

  // private getMaxValue(alternatives: Building[], key: string): number {
  //   const values = alternatives
  //     .map((alt) => (alt as Record<string, unknown>)[key])
  //     .filter((value): value is number => typeof value === 'number');

  //   return values.length > 0 ? Math.max(...values) : 0;
  // }

  // private getMinValue(alternatives: Building[], key: string): number {
  //   const values = alternatives
  //     .map((alt) => (alt as Record<string, unknown>)[key])
  //     .filter((value): value is number => typeof value === 'number');

  //   return values.length > 0 ? Math.min(...values) : 0;
  // }

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
}
