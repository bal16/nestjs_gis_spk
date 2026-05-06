import { CreateAssessmentDTO } from './create-assessment.dto';

describe('CreateAssessmentDTO', () => {
  it('should create a CreateAssessmentDTO instance and assign properties correctly', () => {
    const dtoData = {
      buildingId: 'bldg-123',
      age: 15,
      structure: 80,
      architecture: 75,
      mep: 90,
      utility: 85,
      damage: 10,
      lastMaintenance: '2023-10-01T00:00:00.000Z',
    };

    const dto = new CreateAssessmentDTO();
    dto.buildingId = dtoData.buildingId;
    dto.age = dtoData.age;
    dto.structure = dtoData.structure;
    dto.architecture = dtoData.architecture;
    dto.mep = dtoData.mep;
    dto.utility = dtoData.utility;
    dto.damage = dtoData.damage;
    dto.lastMaintenance = dtoData.lastMaintenance;

    expect(dto).toBeInstanceOf(CreateAssessmentDTO);
    expect(dto.buildingId).toBe(dtoData.buildingId);
    expect(dto.age).toBe(dtoData.age);
    expect(dto.structure).toBe(dtoData.structure);
    expect(dto.architecture).toBe(dtoData.architecture);
    expect(dto.mep).toBe(dtoData.mep);
    expect(dto.utility).toBe(dtoData.utility);
    expect(dto.damage).toBe(dtoData.damage);
    expect(dto.lastMaintenance).toBe(dtoData.lastMaintenance);
  });

  it('should hold correct values without optional properties', () => {
    const basicAssessment: CreateAssessmentDTO = {
      age: 5,
      structure: 95,
      architecture: 90,
      mep: 92,
      utility: 88,
      damage: 2,
    };

    expect(basicAssessment.buildingId).toBeUndefined();
    expect(basicAssessment.lastMaintenance).toBeUndefined();
  });
});
