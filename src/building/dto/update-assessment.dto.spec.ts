import { UpdateAssessmentDTO } from './update-assessment.dto';

describe('UpdateAssessmentDTO', () => {
  it('should create an UpdateAssessmentDTO instance and assign properties correctly', () => {
    const dtoData = {
      buildingId: 'bldg-123',
      age: 20,
      structure: 85,
      architecture: 80,
      mep: 95,
      utility: 90,
      damage: 15,
      lastMaintenance: '2022-05-10T00:00:00.000Z',
    };

    const dto = new UpdateAssessmentDTO();
    dto.buildingId = dtoData.buildingId;
    dto.age = dtoData.age;
    dto.structure = dtoData.structure;
    dto.architecture = dtoData.architecture;
    dto.mep = dtoData.mep;
    dto.utility = dtoData.utility;
    dto.damage = dtoData.damage;
    dto.lastMaintenance = dtoData.lastMaintenance;

    expect(dto).toBeInstanceOf(UpdateAssessmentDTO);
    expect(dto.buildingId).toBe(dtoData.buildingId);
    expect(dto.age).toBe(dtoData.age);
    expect(dto.structure).toBe(dtoData.structure);
    expect(dto.architecture).toBe(dtoData.architecture);
    expect(dto.mep).toBe(dtoData.mep);
    expect(dto.utility).toBe(dtoData.utility);
    expect(dto.damage).toBe(dtoData.damage);
    expect(dto.lastMaintenance).toBe(dtoData.lastMaintenance);
  });

  it('should hold correct values when no properties are provided', () => {
    const emptyAssessment: UpdateAssessmentDTO = {};

    expect(emptyAssessment.buildingId).toBeUndefined();
    expect(emptyAssessment.age).toBeUndefined();
    expect(emptyAssessment.structure).toBeUndefined();
    expect(emptyAssessment.architecture).toBeUndefined();
    expect(emptyAssessment.mep).toBeUndefined();
    expect(emptyAssessment.utility).toBeUndefined();
    expect(emptyAssessment.damage).toBeUndefined();
    expect(emptyAssessment.lastMaintenance).toBeUndefined();
  });

  it('should hold correct values with partial properties', () => {
    const partialAssessment: UpdateAssessmentDTO = {
      structure: 90,
      damage: 5,
    };

    expect(partialAssessment.structure).toBe(90);
    expect(partialAssessment.damage).toBe(5);
    expect(partialAssessment.buildingId).toBeUndefined();
    expect(partialAssessment.age).toBeUndefined();
  });
});
