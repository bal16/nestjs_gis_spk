import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma.service';

@Injectable()
export class BuildingService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    // return this.prisma.building.findMany();
    return this.prisma.building.findMany({
      include: {
        assessments: true,
        sawRunDetails: {
          orderBy: { sawRun: { executedAt: 'desc' } },
          take: 1,
          include: {
            assessment: true,
          },
        },
      },
    });
  }
}
