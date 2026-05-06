import { UpdateBuildingDTO } from './update-building.dto';

describe('UpdateBuildingDTO', () => {
  it('should create an UpdateBuildingDTO instance and assign properties correctly', () => {
    const dtoData = {
      code: 'B01',
      name: 'Main Building',
      latitude: -6.2088,
      longitude: 106.8456,
      score: 85,
      priority: 1,
    };

    const dto = new UpdateBuildingDTO();
    dto.code = dtoData.code;
    dto.name = dtoData.name;
    dto.latitude = dtoData.latitude;
    dto.longitude = dtoData.longitude;
    dto.score = dtoData.score;
    dto.priority = dtoData.priority;

    expect(dto).toBeInstanceOf(UpdateBuildingDTO);
    expect(dto.code).toBe(dtoData.code);
    expect(dto.name).toBe(dtoData.name);
    expect(dto.latitude).toBe(dtoData.latitude);
    expect(dto.longitude).toBe(dtoData.longitude);
    expect(dto.score).toBe(dtoData.score);
    expect(dto.priority).toBe(dtoData.priority);
  });

  it('should hold correct values when no properties are provided', () => {
    const emptyBuilding: UpdateBuildingDTO = {};

    expect(emptyBuilding.code).toBeUndefined();
    expect(emptyBuilding.name).toBeUndefined();
    expect(emptyBuilding.latitude).toBeUndefined();
    expect(emptyBuilding.longitude).toBeUndefined();
    expect(emptyBuilding.score).toBeUndefined();
    expect(emptyBuilding.priority).toBeUndefined();
  });

  it('should hold correct values with partial properties', () => {
    const partialBuilding: UpdateBuildingDTO = {
      name: 'Partial Building',
      score: 90,
    };

    expect(partialBuilding.name).toBe('Partial Building');
    expect(partialBuilding.score).toBe(90);
    expect(partialBuilding.code).toBeUndefined();
  });
});
