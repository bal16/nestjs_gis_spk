export class AssessmentEntity {
  id: string;
  buildingId: string;
  age: number;
  structure: number;
  architecture: number;
  mep: number;
  utility: number;
  damage: number;
  lastMaintenance: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<AssessmentEntity>) {
    Object.assign(this, partial);
  }
}
