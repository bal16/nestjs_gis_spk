import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import type { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from 'src/env';
import type { JwtPayload } from '../dto/jwt.dto';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    const authorization = request.headers.authorization;
    const token = authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const secret = this.configService.get<string>('JWT_REFRESH_SECRET', {
        infer: true,
      });
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });

      request.user = payload;

      return true;
    } catch {
      throw UnauthorizedException;
    }
  }
}
