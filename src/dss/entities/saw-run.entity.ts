import { SawRunDetailEntity } from './saw-run-detail.entity';

export class SawRunEntity {
  id: string;
  executedAt: Date;
  averageScore: number | null;
  totalBuildings: number | null;
  snapshotWeights: any;
  sawRunDetails?: SawRunDetailEntity[];

  constructor(partial: Partial<SawRunEntity>) {
    Object.assign(this, partial);
    if (partial.sawRunDetails) {
      this.sawRunDetails = partial.sawRunDetails.map(
        (d) => new SawRunDetailEntity(d),
      );
    }
  }
}
