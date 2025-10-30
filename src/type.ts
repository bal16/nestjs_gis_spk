import type { Request } from 'express';
import type { JwtPayload } from './auth/dto/jwt.dto';

export interface IResponse<T> {
  message: string;
  statusCode: number;
  data: T;
}

export interface CustomRequest extends Request {
  user: JwtPayload;
}
