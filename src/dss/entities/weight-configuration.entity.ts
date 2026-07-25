export class WeightConfigurationEntity {
  id?: string;
  key: string;
  name: string;
  type: string;
  value: number;
  subWeightFrom: string | null;
  createdAt?: Date;
  updatedAt?: Date;
  subWeights?: WeightConfigurationEntity[];

  constructor(partial: Partial<WeightConfigurationEntity>) {
    Object.assign(this, partial);
    if (partial.subWeights) {
      this.subWeights = partial.subWeights.map(
        (w) => new WeightConfigurationEntity(w),
      );
    }
  }
}
