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
  assessmentCount?: number;

  constructor(
    partial: Partial<BuildingEntity> & { _count?: { assessments: number } },
  ) {
    const { _count, ...rest } = partial;
    Object.assign(this, rest);
    if (_count) {
      this.assessmentCount = _count.assessments;
    }
    if (partial.assessments) {
      this.assessments = partial.assessments.map(
        (a) => new AssessmentEntity(a),
      );
    }
  }
}
