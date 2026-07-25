import { BuildingEntity } from '../../building/entities/building.entity';
import { AssessmentEntity } from '../../building/entities/assessment.entity';

export class SawRunDetailEntity {
  id: string;
  sawRunId: string;
  buildingId: string;
  assessmentId: string;
  score: number;
  priority: number;
  detail: any;
  building?: BuildingEntity | null;
  assessment?: AssessmentEntity | null;

  constructor(partial: Partial<SawRunDetailEntity>) {
    Object.assign(this, partial);
    if (partial.building) {
      this.building = new BuildingEntity(partial.building);
    }
    if (partial.assessment) {
      this.assessment = new AssessmentEntity(partial.assessment);
    }
  }
}
