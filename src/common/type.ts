import type { Request } from 'express';
import type { JwtPayload } from '../auth/dto/jwt.dto';

export interface CustomRequest extends Request {
  user: JwtPayload;
}
