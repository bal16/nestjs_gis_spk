import { Test, TestingModule } from '@nestjs/testing';
import { DssService } from './dss.service';
import { PrismaService } from '../infra/database/prisma.service';
import { BuildingService } from '../building/building.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { BadRequestException } from '@nestjs/common';
import type { BatchUpdateWeightsDTO } from './dto/update-weights.dto';
import type { BuildingWithAssessment } from '../common/type';

describe('DssService', () => {
  let service: DssService;
  let mockPrismaService: DeepMockProxy<PrismaService>;
  let mockBuildingService: DeepMockProxy<BuildingService>;

  const mockSawRun = {
    id: 'run-1',
    date: new Date(),
    averageScore: 0.8,
    totalBuildings: 1,
    snapshotWeights: null,
    executedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DssService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
        {
          provide: BuildingService,
          useValue: mockDeep<BuildingService>(),
        },
      ],
    }).compile();

    service = module.get<DssService>(DssService);
    mockPrismaService = module.get(PrismaService);
    mockBuildingService = module.get(BuildingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllResults', () => {
    it('should return all saw runs', async () => {
      mockPrismaService.sawRun.findMany.mockResolvedValue([mockSawRun]);

      const result = await service.findAllResults();

      expect(result).toEqual([mockSawRun]);
      // expect(mockPrismaService.sawRun.findMany).toHaveBeenCalledWith({
      //   include: {
      //     sawRunDetails: {
      //       include: { building: true },
      //     },
      //   },
      //   orderBy: { executedAt: 'desc' },
      // });
    });
  });

  describe('getResultById', () => {
    it('should return saw run by id', async () => {
      mockPrismaService.sawRun.findUnique.mockResolvedValue(mockSawRun);

      const result = await service.getResultById('run-1');

      expect(result).toEqual(mockSawRun);
      // expect(mockPrismaService.sawRun.findUnique).toHaveBeenCalledWith({
      //   where: { id: 'run-1' },
      //   include: {
      //     sawRunDetails: {
      //       include: {
      //         building: true,
      //         assessment: true,
      //       },
      //     },
      //   },
      // });
    });
  });

  describe('getLastResult', () => {
    it('should return the latest saw run', async () => {
      mockPrismaService.sawRun.findFirst.mockResolvedValue(mockSawRun);

      const result = await service.getLastResult();

      expect(result).toEqual(mockSawRun);
      // expect(mockPrismaService.sawRun.findFirst).toHaveBeenCalledWith({
      //   include: {
      //     sawRunDetails: {
      //       include: {
      //         building: true,
      //         assessment: true,
      //       },
      //     },
      //   },
      //   orderBy: {
      //     executedAt: 'desc',
      //   },
      // });
    });
  });

  describe('getWeights', () => {
    it('should return weight configurations', async () => {
      const mockWeights = [
        {
          key: 'c1',
          value: 0.5,
          type: 'benefit',
          subWeights: [],
          name: '',
          subWeightFrom: null,
        },
      ];
      mockPrismaService.weightConfiguration.findMany.mockResolvedValue(
        mockWeights,
      );

      const result = await service.getWeights();

      expect(result).toEqual(mockWeights);
      // expect(
      //   mockPrismaService.weightConfiguration.findMany,
      // ).toHaveBeenCalledWith({
      //   where: { subWeightFrom: null },
      //   include: { subWeights: true },
      // });
    });
  });

  describe('updateWeights', () => {
    it('should throw error if total weights !== 1.0', async () => {
      const dto: BatchUpdateWeightsDTO = {
        weights: [{ key: 'c1', value: 0.5, subWeights: [] }],
      };

      await expect(service.updateWeights(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error if total sub-weights !== 1.0', async () => {
      const dto: BatchUpdateWeightsDTO = {
        weights: [
          {
            key: 'c1',
            value: 1.0,
            subWeights: [{ key: 'c11', value: 0.5 }],
          },
        ],
      };

      await expect(service.updateWeights(dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should update weights successfully', async () => {
      const dto: BatchUpdateWeightsDTO = {
        weights: [
          {
            key: 'c1',
            value: 1.0,
            subWeights: [{ key: 'c11', value: 1.0 }],
          },
        ],
      };

      mockPrismaService.$transaction.mockImplementation((callback) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
        return callback(mockPrismaService);
      });
      mockPrismaService.weightConfiguration.update.mockResolvedValue({
        key: 'c1',
        value: 1.0,
        type: 'benefit',
        name: '',
        subWeightFrom: null,
      });

      const result = await service.updateWeights(dto);

      expect(result).toBe(true);
      // expect(mockPrismaService.weightConfiguration.update).toHaveBeenCalledWith(
      //   {
      //     where: { key: 'c1' },
      //     data: { value: 1.0 },
      //   },
      // );
      // expect(mockPrismaService.weightConfiguration.update).toHaveBeenCalledWith(
      //   {
      //     where: { key: 'c11' },
      //     data: { value: 1.0 },
      //   },
      // );
    });
  });

  describe('calculateAndSave', () => {
    it('should calculate preferences and save run', async () => {
      const mockWeights = [
        {
          key: 'c1',
          type: 'benefit',
          value: 0.2,
          name: 'Age',
          subWeights: [],
          subWeightFrom: null,
        },
        {
          key: 'c2',
          type: 'benefit',
          value: 0.2,
          name: 'Structure',
          subWeights: [],
          subWeightFrom: null,
        },
        {
          key: 'c3',
          type: 'benefit',
          value: 0.2,
          name: 'Utility',
          subWeights: [],
          subWeightFrom: null,
        },
        {
          key: 'c4',
          type: 'cost',
          value: 0.2,
          name: 'Damage',
          subWeights: [],
          subWeightFrom: null,
        },
        {
          key: 'c5',
          type: 'benefit',
          value: 0.1,
          name: 'Maintenance',
          subWeights: [],
          subWeightFrom: null,
        },
        {
          key: 'priority',
          type: 'benefit',
          value: 0.1,
          name: 'Priority',
          subWeights: [],
          subWeightFrom: null,
        },
      ];

      const mockAlternatives: BuildingWithAssessment[] = [
        {
          id: 'building-no-assessment',
          priority: 1,
          name: 'Building without assessment',
          score: 0,
          latitude: 0,
          longitude: 0,
          code: 'E00',
          createdAt: new Date(),
          updatedAt: new Date(),
          assessments: [],
        },
        {
          id: 'building-1',
          priority: 0,
          name: 'Building 1',
          score: 80,
          latitude: 821862,
          longitude: 909,
          code: 'E11',
          createdAt: new Date(),
          updatedAt: new Date(),
          assessments: [
            {
              id: 'assessment-1',
              buildingId: 'building-1',
              createdAt: new Date(),
              updatedAt: new Date(),
              age: 15,
              structure: 3,
              architecture: 3,
              mep: 3,
              utility: 200,
              damage: 2,
              lastMaintenance: new Date(new Date().getFullYear() - 3, 0, 1),
            },
          ],
        },
        {
          id: 'building-2',
          priority: 0,
          name: 'Building 2',
          score: 60,
          latitude: 821862,
          longitude: 909,
          code: 'E12',
          createdAt: new Date(),
          updatedAt: new Date(),
          assessments: [
            {
              id: 'assessment-2',
              buildingId: 'building-2',
              createdAt: new Date(),
              updatedAt: new Date(),
              age: 5,
              structure: 3,
              architecture: 3,
              mep: 3,
              utility: 50,
              damage: 0,
              lastMaintenance: new Date(),
            },
          ],
        },
        {
          id: 'building-3',
          priority: null,
          name: 'Building 3',
          score: 90,
          latitude: 821862,
          longitude: 909,
          code: 'E13',
          createdAt: new Date(),
          updatedAt: new Date(),
          assessments: [
            {
              id: 'assessment-3',
              buildingId: 'building-3',
              createdAt: new Date(),
              updatedAt: new Date(),
              age: 25,
              structure: 3,
              architecture: 3,
              mep: 3,
              utility: 600,
              damage: 5,
              lastMaintenance: new Date(new Date().getFullYear() - 6, 0, 1),
            },
          ],
        },
      ];

      jest.spyOn(service, 'getWeights').mockResolvedValue(mockWeights);
      mockBuildingService.findAllWithAssessment.mockResolvedValue(
        mockAlternatives,
      );
      mockPrismaService.sawRun.create.mockResolvedValue(mockSawRun);

      const result = await service.calculateAndSave();

      expect(result).toBe(true);
      // expect(mockPrismaService.sawRun.create).toHaveBeenCalled();
    });
  });

  describe('deleteRun', () => {
    it('should delete a saw run', async () => {
      mockPrismaService.sawRun.delete.mockResolvedValue(mockSawRun);
      const result = await service.deleteRun('run-1');
      expect(result).toBe(true);
      // expect(mockPrismaService.sawRun.delete).toHaveBeenCalledWith({
      //   where: { id: 'run-1' },
      // });
    });
  });

  describe('deleteRunDetail', () => {
    it('should delete a saw run detail', async () => {
      mockPrismaService.sawRun.delete.mockResolvedValue(mockSawRun);
      const result = await service.deleteRunDetail('detail-1');
      expect(result).toBe(true);
      // expect(mockPrismaService.sawRun.delete).toHaveBeenCalledWith({
      //   where: { id: 'detail-1' },
      // });
    });
  });
});
