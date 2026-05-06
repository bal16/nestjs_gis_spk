import {
  BatchUpdateWeightsDTO,
  UpdateWeightItemDTO,
} from './update-weights.dto';

describe('UpdateWeightItemDTO', () => {
  it('should create an UpdateWeightItemDTO instance and assign properties correctly including subWeights', () => {
    const subWeight = new UpdateWeightItemDTO();
    subWeight.key = 'sub-criteria-1';
    subWeight.value = 0.5;

    const dto = new UpdateWeightItemDTO();
    dto.key = 'main-criteria';
    dto.value = 0.8;
    dto.subWeights = [subWeight];

    expect(dto).toBeInstanceOf(UpdateWeightItemDTO);
    expect(dto.key).toBe('main-criteria');
    expect(dto.value).toBe(0.8);
    expect(dto.subWeights).toBeDefined();
    expect(dto.subWeights?.length).toBe(1);
    expect(dto.subWeights?.[0].key).toBe('sub-criteria-1');
    expect(dto.subWeights?.[0].value).toBe(0.5);
  });

  it('should hold correct values without optional properties (subWeights)', () => {
    const dto: UpdateWeightItemDTO = {
      key: 'criteria-only',
      value: 1.0,
    };

    expect(dto.key).toBe('criteria-only');
    expect(dto.value).toBe(1.0);
    expect(dto.subWeights).toBeUndefined();
  });
});

describe('BatchUpdateWeightsDTO', () => {
  it('should create a BatchUpdateWeightsDTO instance and assign properties correctly', () => {
    const weightItem = new UpdateWeightItemDTO();
    weightItem.key = 'structure';
    weightItem.value = 0.4;

    const batchDto = new BatchUpdateWeightsDTO();
    batchDto.weights = [weightItem];

    expect(batchDto).toBeInstanceOf(BatchUpdateWeightsDTO);
    expect(batchDto.weights).toBeDefined();
    expect(batchDto.weights.length).toBe(1);
    expect(batchDto.weights[0].key).toBe('structure');
  });
});
