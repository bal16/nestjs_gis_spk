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
}
