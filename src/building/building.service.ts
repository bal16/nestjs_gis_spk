import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/database/prisma.service';
import type { CreateBuildingDTO } from './dto/create-building.dto';
import type { UpdateBuildingDTO } from './dto/update-building.dto';
import type { CreateAssessmentDTO } from './dto/create-assessment.dto';
import type { UpdateAssessmentDTO } from './dto/update-assessment.dto';
import { BuildingEntity } from './entities/building.entity';
import { AssessmentEntity } from './entities/assessment.entity';

@Injectable()
export class BuildingService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<BuildingEntity[]> {
    const buildings = await this.prisma.building.findMany({
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

    return buildings.map((b) => new BuildingEntity(b));
  }

  findAllWithAssessments() {
    return this.prisma.building.findMany({
      include: {
        assessments: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
  }

  async create(data: CreateBuildingDTO): Promise<BuildingEntity> {
    const building = await this.prisma.building.create({
      data,
    });

    return new BuildingEntity(building);
  }

  async update(data: UpdateBuildingDTO, id: string): Promise<BuildingEntity> {
    const building = await this.prisma.building.update({
      where: {
        id,
      },
      data,
    });

    return new BuildingEntity(building);
  }

  async delete(id: string) {
    return this.prisma.building.delete({ where: { id } });
  }

  async findOneWithAssessments(code: string): Promise<BuildingEntity | null> {
    const building = await this.prisma.building.findFirst({
      where: { code },
      include: { assessments: true },
    });

    return building ? new BuildingEntity(building) : null;
  }

  async createAssessment(
    code: string,
    createAssessmentDTO: CreateAssessmentDTO,
  ): Promise<AssessmentEntity> {
    const building = await this.prisma.building.findFirst({
      where: { code },
      select: { id: true },
    });

    const assessment = await this.prisma.assessment.create({
      data: {
        ...createAssessmentDTO,
        buildingId: building!.id,
      },
    });

    return new AssessmentEntity(assessment);
  }

  async updateAssessment(
    code: string,
    assessmentId: string,
    updateAssessmentDTO: UpdateAssessmentDTO,
  ): Promise<AssessmentEntity> {
    const building = await this.prisma.building.findFirst({
      where: { code },
      select: { id: true },
    });

    const assessment = await this.prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        ...updateAssessmentDTO,
        buildingId: building!.id,
      },
    });

    return new AssessmentEntity(assessment);
  }

  async deleteAssessment(assessmentId: string) {
    return this.prisma.assessment.delete({
      where: { id: assessmentId },
    });
  }
}
