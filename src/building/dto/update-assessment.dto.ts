import { PartialType } from '@nestjs/mapped-types';
import { CreateAssessmentDTO } from './create-assessment.dto';

export class UpdateAssessmentDTO extends PartialType(CreateAssessmentDTO) {}

