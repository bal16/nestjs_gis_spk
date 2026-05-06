import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateAssessmentDTO {
  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsNumber()
  age: number;

  @IsNumber()
  structure: number;

  @IsNumber()
  architecture: number;

  @IsNumber()
  mep: number;

  @IsNumber()
  utility: number;

  @IsNumber()
  damage: number;

  @IsOptional()
  @IsDateString()
  lastMaintenance?: string;
}
