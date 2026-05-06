import type { Request } from 'express';
import type { JwtPayload } from '../auth/dto/jwt.dto';
import type { Prisma } from 'src/generated/prisma/client';
// import { Prisma } from 'src/generated/prisma';

export interface CustomRequest extends Request {
  user: JwtPayload;
}

// Gunakan tipe ini di Service
export type BuildingWithAssessment = Prisma.BuildingGetPayload<{
  include: { assessments: true };
}>;
