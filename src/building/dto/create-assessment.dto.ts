import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateAssessmentDTO {
  @IsString()
  @IsOptional()
  buildingId?: string;

  @IsNumber()
  @IsNotEmpty()
  age: number;

  @IsNumber()
  @IsNotEmpty()
  structure: number;

  @IsNumber()
  @IsNotEmpty()
  architecture: number;

  @IsNumber()
  @IsNotEmpty()
  mep: number;

  @IsNumber()
  @IsNotEmpty()
  utility: number;

  @IsNumber()
  @IsNotEmpty()
  damage: number;

  @IsOptional()
  @IsDateString()
  lastMaintenance?: string;
}

