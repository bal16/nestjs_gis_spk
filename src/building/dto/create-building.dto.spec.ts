import { CreateBuildingDTO } from './create-building.dto';

describe('CreateBuildingDTO', () => {
  it('should create a CreateBuildingDTO instance and assign properties correctly', () => {
    const dtoData = {
      code: 'B01',
      name: 'Main Building',
      latitude: -6.2088,
      longitude: 106.8456,
      score: 85,
      priority: 1,
    };

    const dto = new CreateBuildingDTO();
    dto.code = dtoData.code;
    dto.name = dtoData.name;
    dto.latitude = dtoData.latitude;
    dto.longitude = dtoData.longitude;
    dto.score = dtoData.score;
    dto.priority = dtoData.priority;

    expect(dto).toBeInstanceOf(CreateBuildingDTO);
    expect(dto.code).toBe(dtoData.code);
    expect(dto.name).toBe(dtoData.name);
    expect(dto.latitude).toBe(dtoData.latitude);
    expect(dto.longitude).toBe(dtoData.longitude);
    expect(dto.score).toBe(dtoData.score);
    expect(dto.priority).toBe(dtoData.priority);
  });

  it('should hold correct values without optional properties', () => {
    const basicBuilding: CreateBuildingDTO = {
      code: 'B02',
      name: 'Secondary Building',
      latitude: -6.2089,
      longitude: 106.8457,
    };

    expect(basicBuilding.score).toBeUndefined();
    expect(basicBuilding.priority).toBeUndefined();
  });
});
