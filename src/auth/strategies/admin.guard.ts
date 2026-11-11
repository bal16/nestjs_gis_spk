import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../entities/jwt-payload.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    if (!request.user) {
      throw new UnauthorizedException('Authentication required');
    }

    if (!request.user.isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
