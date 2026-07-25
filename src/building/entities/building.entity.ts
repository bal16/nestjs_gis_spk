import { AssessmentEntity } from './assessment.entity';

export class BuildingEntity {
  id: string;
  code: string;
  name: string;
  latitude: number;
  longitude: number;
  score: number | null;
  priority: number | null;
  createdAt: Date;
  updatedAt: Date;
  assessments?: AssessmentEntity[];

  constructor(partial: Partial<BuildingEntity>) {
    Object.assign(this, partial);
    if (partial.assessments) {
      this.assessments = partial.assessments.map(
        (a) => new AssessmentEntity(a),
      );
    }
  }
}
