import { Test, TestingModule } from '@nestjs/testing';
import { BuildingController } from './building.controller';
import { BuildingService } from './building.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { HttpStatus } from '@nestjs/common';
import { WebResponse } from '../common/responses/web.response';
import type { CreateBuildingDTO } from './dto/create-building.dto';
import type { UpdateBuildingDTO } from './dto/update-building.dto';
import type { CreateAssessmentDTO } from './dto/create-assessment.dto';
import type { UpdateAssessmentDTO } from './dto/update-assessment.dto';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';

describe('BuildingController', () => {
  let controller: BuildingController;
  let mockBuildingService: DeepMockProxy<BuildingService>;

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
    assessments: [],
    sawRunDetails: [],
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
    lastMaintenance: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildingController],
      providers: [
        {
          provide: BuildingService,
          useValue: mockDeep<BuildingService>(),
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<BuildingController>(BuildingController);
    mockBuildingService = module.get(BuildingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all buildings', async () => {
      mockBuildingService.findAll.mockResolvedValue([mockBuilding]);

      const result = await controller.findAll();

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual([mockBuilding]);
    });
  });

  describe('create', () => {
    it('should create a building', async () => {
      const createDto: CreateBuildingDTO = {
        code: 'B001',
        name: 'Test Building',
        latitude: 1.0,
        longitude: 1.0,
      };
      mockBuildingService.create.mockResolvedValue(mockBuilding);

      const result = await controller.create(createDto);

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Building created successfully');
      expect(result.data).toEqual(mockBuilding);
      // expect(mockBuildingService.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a building', async () => {
      const updateDto: UpdateBuildingDTO = { name: 'Updated Name' };
      const updatedBuilding = { ...mockBuilding, name: 'Updated Name' };
      mockBuildingService.update.mockResolvedValue(updatedBuilding);

      const result = await controller.update(updateDto, 'building-id');

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Building updated successfully');
      expect(result.data).toEqual(updatedBuilding);
      // expect(mockBuildingService.update).toHaveBeenCalledWith(
      //   updateDto,
      //   'building-id',
      // );
    });
  });

  describe('delete', () => {
    it('should delete a building', async () => {
      mockBuildingService.delete.mockResolvedValue(mockBuilding);

      const result = await controller.delete('building-id');

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Building deleted successfully');
      expect(result.data).toEqual(mockBuilding);
      // expect(mockBuildingService.delete).toHaveBeenCalledWith('building-id');
    });
  });

  describe('findAssessments', () => {
    it('should return assessments for a building', async () => {
      const buildingWithAssessments = {
        ...mockBuilding,
        assessments: [mockAssessment],
      };
      mockBuildingService.findOneWithAssessments.mockResolvedValue(
        buildingWithAssessments,
      );

      const result = await controller.findAssessments('building-code');

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(buildingWithAssessments);
      // expect(mockBuildingService.findOneWithAssessments).toHaveBeenCalledWith(
      //   'building-id',
      // );
    });
  });

  describe('createAssessment', () => {
    it('should create an assessment', async () => {
      const createAssessmentDto: CreateAssessmentDTO = {
        age: 10,
        structure: 5,
        architecture: 5,
        mep: 5,
        utility: 5,
        damage: 5,
      };
      mockBuildingService.createAssessment.mockResolvedValue(mockAssessment);

      const result = await controller.createAssessment(
        'building-code',
        createAssessmentDto,
      );

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('Assessment created successfully');
      expect(result.data).toEqual(mockAssessment);
      // expect(mockBuildingService.createAssessment).toHaveBeenCalledWith(
      //   'building-id',
      //   createAssessmentDto,
      // );
    });
  });

  describe('updateAssessment', () => {
    it('should update an assessment', async () => {
      const updateAssessmentDto: UpdateAssessmentDTO = { age: 15 };
      const updatedAssessment = { ...mockAssessment, age: 15 };
      mockBuildingService.updateAssessment.mockResolvedValue(updatedAssessment);

      const result = await controller.updateAssessment(
        'building-code',
        'assessment-id',
        updateAssessmentDto,
      );

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Assessment updated successfully');
      expect(result.data).toEqual(updatedAssessment);
      // expect(mockBuildingService.updateAssessment).toHaveBeenCalledWith(
      //   'building-id',
      //   'assessment-id',
      //   updateAssessmentDto,
      // );
    });
  });

  describe('deleteAssessment', () => {
    it('should delete an assessment', async () => {
      mockBuildingService.deleteAssessment.mockResolvedValue(mockAssessment);

      const result = await controller.deleteAssessment('assessment-id');

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Assessment deleted successfully');
      expect(result.data).toEqual(mockAssessment);
      // expect(mockBuildingService.deleteAssessment).toHaveBeenCalledWith(
      //   'assessment-id',
      // );
    });
  });
});
