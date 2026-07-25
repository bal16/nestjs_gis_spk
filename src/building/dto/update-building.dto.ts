import { PartialType } from '@nestjs/mapped-types';
import { CreateBuildingDTO } from './create-building.dto';

export class UpdateBuildingDTO extends PartialType(CreateBuildingDTO) {}

