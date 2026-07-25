import type { Request } from 'express';
import type { JwtPayload } from '../auth/entities/jwt-payload.entity';
import type { Prisma } from 'src/generated/prisma/client';

export interface CustomRequest extends Request {
  user: JwtPayload;
}

// Gunakan tipe ini di Service
export type BuildingWithAssessment = Prisma.BuildingGetPayload<{
  include: { assessments: true };
}>;
