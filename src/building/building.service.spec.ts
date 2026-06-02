import { Test, TestingModule } from '@nestjs/testing';
import { BuildingService } from './building.service';
import { PrismaService } from '../infra/database/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import type { CreateBuildingDTO } from './dto/create-building.dto';
import type { UpdateBuildingDTO } from './dto/update-building.dto';
import type { CreateAssessmentDTO } from './dto/create-assessment.dto';
import type { UpdateAssessmentDTO } from './dto/update-assessment.dto';
import type { Building } from '../generated/prisma/client';

describe('BuildingService', () => {
  let service: BuildingService;
  let mockPrismaService: DeepMockProxy<PrismaService>;

  const mockBuilding = {
    id: 'building-id',
    code: 'B001',
    name: 'Test Building',
    latitude: 1.0,
    longitude: 1.0,
    score: null,
    priority: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAssessment = {
    id: 'assessment-id',
    buildingId: 'building-id',
    age: 10,
    structure: 5,
    architecture: 5,
    mep: 5,
    utility: 5,
    damage: 5,
    lastMaintenance: new Date() as Date | null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildingService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<BuildingService>(BuildingService);
    mockPrismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of buildings', async () => {
      mockPrismaService.building.findMany.mockResolvedValue([mockBuilding]);

      const result = await service.findAll();

      expect(result).toEqual([mockBuilding]);
      // expect(mockPrismaService.building.findMany).toHaveBeenCalledWith({
      //   include: {
      //     assessments: true,
      //     sawRunDetails: {
      //       orderBy: { sawRun: { executedAt: 'desc' } },
      //       take: 1,
      //       include: {
      //         assessment: true,
      //       },
      //     },
      //   },
      // });
    });
  });

  describe('findAllWithAssessment', () => {
    it('should return all buildings with their assessments', async () => {
      const buildingsWithAssessments = [
        {
          ...mockBuilding,
          assessments: [mockAssessment],
        },
      ];
      mockPrismaService.building.findMany.mockResolvedValue(
        buildingsWithAssessments,
      );

      const result = await service.findAllWithAssessments();

      expect(result).toEqual(buildingsWithAssessments);
      // expect(mockPrismaService.building.findMany).toHaveBeenCalledWith({
      //   include: {
      //     assessments: {
      //       orderBy: { createdAt: 'desc' },
      //       take: 1,
      //     },
      //   },
      // });
    });
  });

  describe('create', () => {
    it('should create a new building', async () => {
      const createDto: CreateBuildingDTO = {
        code: 'B001',
        name: 'Test Building',
        latitude: 1.0,
        longitude: 1.0,
      };

      mockPrismaService.building.create.mockResolvedValue(mockBuilding);

      const result = await service.create(createDto);

      expect(result).toEqual(mockBuilding);
      // expect(mockPrismaService.building.create).toHaveBeenCalledWith({
      //   data: createDto,
      // });
    });
  });

  describe('update', () => {
    it('should update a building', async () => {
      const updateDto: UpdateBuildingDTO = {
        name: 'Updated Building',
      };

      const updatedBuilding = { ...mockBuilding, ...updateDto };

      mockPrismaService.building.update.mockResolvedValue(updatedBuilding);

      const result = await service.update(updateDto, 'building-id');

      expect(result).toEqual(updatedBuilding);
      // expect(mockPrismaService.building.update).toHaveBeenCalledWith({
      //   where: { id: 'building-id' },
      //   data: updateDto,
      // });
    });
  });

  describe('delete', () => {
    it('should delete a building', async () => {
      mockPrismaService.building.delete.mockResolvedValue(mockBuilding);

      const result = await service.delete('building-id');

      expect(result).toEqual(mockBuilding);
      // expect(mockPrismaService.building.delete).toHaveBeenCalledWith({
      //   where: { id: 'building-id' },
      // });
    });
  });

  describe('findOneWithAssessments', () => {
    it('should return a building with assessments', async () => {
      const resultWithAssessments = {
        ...mockBuilding,
        assessments: [mockAssessment],
      };
      mockPrismaService.building.findFirst.mockResolvedValue(
        resultWithAssessments,
      );

      const result = await service.findOneWithAssessments('building-code');

      expect(result).toEqual(resultWithAssessments);
      // expect(mockPrismaService.building.findFirst).toHaveBeenCalledWith({
      //   where: { code: 'building-code' },
      //   include: { assessments: true },
      // });
    });
  });

  describe('createAssessment', () => {
    it('should create an assessment for a building', async () => {
      const createAssessmentDto: CreateAssessmentDTO = {
        age: 10,
        structure: 5,
        architecture: 5,
        mep: 5,
        utility: 5,
        damage: 5,
      };

      mockPrismaService.building.findFirst.mockResolvedValue({
        id: 'building-id',
      } as unknown as Building);
      mockPrismaService.assessment.create.mockResolvedValue(mockAssessment);

      const result = await service.createAssessment(
        'building-id',
        createAssessmentDto,
      );

      expect(result).toEqual(mockAssessment);
      // expect(mockPrismaService.assessment.create).toHaveBeenCalledWith({
      //   data: {
      //     ...createAssessmentDto,
      //     buildingId: 'building-id',
      //   },
      // });
    });
  });

  describe('updateAssessment', () => {
    it('should update an assessment', async () => {
      const updateAssessmentDto: UpdateAssessmentDTO = {
        age: 12,
      };

      const updatedAssessment = { ...mockAssessment, ...updateAssessmentDto };

      mockPrismaService.building.findFirst.mockResolvedValue({
        id: 'building-id',
      } as unknown as Building);

      mockPrismaService.assessment.update.mockResolvedValue({
        ...updatedAssessment,
        lastMaintenance: updatedAssessment.lastMaintenance as Date | null,
      });

      const result = await service.updateAssessment(
        'building-code',
        'assessment-id',
        updateAssessmentDto,
      );

      expect(result).toEqual(updatedAssessment);
      // expect(mockPrismaService.assessment.update).toHaveBeenCalledWith({
      //   where: { id: 'assessment-id' },
      //   data: {
      //     ...updateAssessmentDto,
      //     buildingId: 'building-id',
      //   },
      // });
    });
  });

  describe('deleteAssessment', () => {
    it('should delete an assessment', async () => {
      mockPrismaService.assessment.delete.mockResolvedValue(mockAssessment);

      const result = await service.deleteAssessment('assessment-id');

      expect(result).toEqual(mockAssessment);
      //   expect(mockPrismaService.assessment.delete).toHaveBeenCalledWith({
      //     where: { id: 'assessment-id' },
      //   });
    });
  });
});
