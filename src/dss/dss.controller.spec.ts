import { Test, TestingModule } from '@nestjs/testing';
import { DssController } from './dss.controller';
import { DssService } from './dss.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { HttpStatus } from '@nestjs/common';
import { WebResponse } from '../common/responses/web.response';
import type { BatchUpdateWeightsDTO } from './dto/update-weights.dto';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';

describe('DssController', () => {
  let controller: DssController;
  let mockDssService: DeepMockProxy<DssService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DssController],
      providers: [
        {
          provide: DssService,
          useValue: mockDeep<DssService>(),
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DssController>(DssController);
    mockDssService = module.get(DssService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllResults', () => {
    it('should return all runs', async () => {
      //       DssService.findAllResults(): Promise<({
      //     sawRunDetails: ({
      //         building: {
      //             name: string;
      //             id: string;
      //             score: number | null;
      //             priority: number | null;
      //             code: string;
      //             latitude: number;
      //             longitude: number;
      //             createdAt: Date;
      //             updatedAt: Date;
      //         } | null;
      //     } & {
      //         id: string;
      //         sawRunId: string;
      //         buildingId: string;
      //         assessmentId: string;
      //         score: number;
      //         priority: number;
      //         detail: JsonValue;
      //     })[];
      // } & {
      //     id: string;
      //     date: Date;
      //     averageScore: number | null;
      //     totalBuildings: number | null;
      //     snapshotWeights: JsonValue | null;
      //     executedAt: Date;
      // })[]>

      const mockData = [
        {
          id: 'run-1',
          date: new Date(),
          averageScore: 80,
          totalBuildings: 10,
          snapshotWeights: { c1: 0.2, c2: 0.3, c3: 0.5 },
          executedAt: new Date(),
          sawRunDetails: [
            {
              id: 'detail-1',
              sawRunId: 'run-1',
              assessmentId: 'assessment-1',
              buildingId: 'building-1',
              score: 80,
              priority: 1,
              detail: {},
              building: {
                id: 'building-1',
                name: 'Building 1',
                score: 80,
                priority: 1,
                code: 'B1',
                latitude: 0,
                longitude: 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          ],
        },
      ];
      mockDssService.findAllResults.mockResolvedValue(mockData);

      const result = await controller.findAllResults();

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getLastResults', () => {
    it('should return the latest run', async () => {
      const mockData = {
        id: 'run-1',
        date: new Date(),
        averageScore: 80,
        totalBuildings: 10,
        snapshotWeights: { c1: 0.2, c2: 0.3, c3: 0.5 },
        executedAt: new Date(),
        sawRunDetails: [
          {
            id: 'detail-1',
            sawRunId: 'run-1',
            assessmentId: 'assessment-1',
            buildingId: 'building-1',
            score: 80,
            priority: 1,
            detail: {},
            assessment: {
              id: 'assessment-1',
              buildingId: 'building-1',
              age: 15,
              structure: 4,
              architecture: 3,
              mep: 5,
              utility: 200,
              damage: 2,
              lastMaintenance: new Date('2020-01-01'),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            building: {
              id: 'building-1',
              name: 'Building 1',
              score: 80,
              priority: 1,
              code: 'B1',
              latitude: 0,
              longitude: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };
      mockDssService.getLastResult.mockResolvedValue(mockData);

      const result = await controller.getLastResults();

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('getResultById', () => {
    it('should return a run by id', async () => {
      const mockData = {
        id: 'run-1',
        date: new Date(),
        averageScore: 80,
        totalBuildings: 10,
        snapshotWeights: { c1: 0.2, c2: 0.3, c3: 0.5 },
        executedAt: new Date(),
        sawRunDetails: [
          {
            id: 'detail-1',
            sawRunId: 'run-1',
            assessmentId: 'assessment-1',
            buildingId: 'building-1',
            score: 80,
            priority: 1,
            detail: {},
            assessment: {
              id: 'assessment-1',
              buildingId: 'building-1',
              age: 15,
              structure: 4,
              architecture: 3,
              mep: 5,
              utility: 200,
              damage: 2,
              lastMaintenance: new Date('2020-01-01'),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            building: {
              id: 'building-1',
              name: 'Building 1',
              score: 80,
              priority: 1,
              code: 'B1',
              latitude: 0,
              longitude: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          },
        ],
      };
      mockDssService.getResultById.mockResolvedValue(mockData);

      const result = await controller.getResultById('run-1');

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(mockData);
      // expect(mockDssService.getResultById).toHaveBeenCalledWith('run-1');
    });
  });

  describe('getWeights', () => {
    it('should return weights', async () => {
      const mockData = [
        {
          key: 'c1',
          value: 0.2,
          name: 'Criteria 1',
          subWeightFrom: null,
          type: 'cost',
          subWeights: [],
        },
      ];
      mockDssService.getWeights.mockResolvedValue(mockData);

      const result = await controller.getWeights();

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('updateWeights', () => {
    it('should update weights', async () => {
      const dto: BatchUpdateWeightsDTO = {
        weights: [{ key: 'c1', value: 0.2, subWeights: [] }],
      };
      mockDssService.updateWeights.mockResolvedValue(true);

      const result = await controller.updateWeights(dto);

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(true);
      // expect(mockDssService.updateWeights).toHaveBeenCalledWith(dto);
    });
  });

  describe('calculate', () => {
    it('should calculate and save results', async () => {
      mockDssService.calculateAndSave.mockResolvedValue(true);

      const result = await controller.calculate();

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(true);
    });
  });

  describe('deleteRunDetail', () => {
    it('should delete a run detail', async () => {
      mockDssService.deleteRunDetail.mockResolvedValue(true);

      const result = await controller.deleteRunDetail('detail-1');

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(true);
      // expect(mockDssService.deleteRunDetail).toHaveBeenCalledWith('detail-1');
    });
  });

  describe('deleteRun', () => {
    it('should delete a run', async () => {
      mockDssService.deleteRun.mockResolvedValue(true);

      const result = await controller.deleteRun('run-1');

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(true);
      // expect(mockDssService.deleteRun).toHaveBeenCalledWith('run-1');
    });
  });
});
