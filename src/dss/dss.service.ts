import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma.service';
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
}
