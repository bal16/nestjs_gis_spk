import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAssessmentDTO {
  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsNumber()
  @IsOptional()
  age?: number;

  @IsNumber()
  @IsOptional()
  structure?: number;

  @IsNumber()
  @IsOptional()
  architecture?: number;

  @IsNumber()
  @IsOptional()
  mep?: number;

  @IsNumber()
  @IsOptional()
  utility?: number;

  @IsNumber()
  @IsOptional()
  damage?: number;

  @IsOptional()
  @IsDateString()
  lastMaintenance?: string;
}
