import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateWeightItemDTO {
  @IsString()
  key: string;

  @IsNumber()
  value: number;

  @IsArray()
  @IsOptional()
  subWeights?: UpdateWeightItemDTO[];
}

export class BatchUpdateWeightsDTO {
  @IsArray()
  weights: UpdateWeightItemDTO[];
}
