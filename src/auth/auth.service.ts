import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import type { User } from '../../generated/prisma';
import { LoginDTO, type LoginResponse } from './dto/login.dto';
import type {
  RegistrationDTO,
  RegistrationResponse,
} from './dto/registeration.dto';

import { UserService } from '../user/user.service';
import { createId } from '@paralleldrive/cuid2';
import type { IResponse } from '../type';
import type { EnvironmentVariables } from '../env';
import type { JwtPayload } from './dto/jwt.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async validate(input: LoginDTO) {
    const user = await this.userService.getOneByEmailOrName(input.email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await this.comparePassword(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async signIn(user: User): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      admin: user.isAdmin,
    };

    const secret = this.configService.get<string>('JWT_SECRET', {
      infer: true,
    });

    const token = await this.jwtService.signAsync(payload, { secret });

    return {
      access_token: token,
      username: user.email,
      id: user.id,
    };
  }

  async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async authenticate(input: LoginDTO): Promise<IResponse<LoginResponse>> {
    const user = await this.validate(input);
    const data = await this.signIn(user);

    return {
      message: 'success',
      statusCode: 200,
      data,
    };
  }

  async register(
    input: RegistrationDTO,
  ): Promise<IResponse<RegistrationResponse>> {
    const user = await this.userService.getOneByEmailOrName(input.email);

    if (user) {
      throw new BadRequestException();
    }

    const id = createId();
    const hashedPassword = await this.hashPassword(input.password);

    await this.userService.create({
      ...input,
      id,
      password: hashedPassword,
      name: input.username,
      isAdmin: false,
      avatar: input.avatar || null,
    });

    return {
      message: 'success',
      statusCode: 201,
      data: {
        id,
        username: input.username,
        email: input.email,
      },
    };
  }
}
