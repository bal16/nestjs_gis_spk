import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma.service';
import type { CreateBuildingDTO } from './dto/create-building.dto';
import type { UpdateBuildingDTO } from './dto/update-building.dto';
import type { CreateAssessmentDTO } from './dto/create-assessment.dto';

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

  create(data: CreateBuildingDTO) {
    return this.prisma.building.create({
      data,
    });
  }

  update(data: UpdateBuildingDTO, id: string) {
    return this.prisma.building.update({
      where: {
        id,
      },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.building.delete({ where: { id } });
  }

  findOneWithAssessments(code: string) {
    return this.prisma.building.findFirst({
      where: { code },
      include: { assessments: true },
    });
  }

  async createAssessment(
    code: string,
    createAssessmentDTO: CreateAssessmentDTO,
  ) {
    const buiilding = await this.prisma.building.findFirst({
      where: { code },
      select: { id: true },
    });

    return this.prisma.assessment.create({
      data: {
        ...createAssessmentDTO,
        buildingId: buiilding!.id,
      },
    });
  }
}
