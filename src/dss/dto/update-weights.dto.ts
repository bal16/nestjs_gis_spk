import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateWeightItemDTO {
  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  @IsArray()
  @IsOptional()
  subWeights?: UpdateWeightItemDTO[];
}

export class BatchUpdateWeightsDTO {
  @IsArray()
  weights: UpdateWeightItemDTO[];
}
