import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { User } from '../../generated/prisma';
import { LoginDTO } from './dto/login.dto';

import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
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

    console.log(isPasswordValid);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async signIn(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      admin: user.isAdmin,
    };
    const token = await this.jwtService.signAsync(payload);
    return {
      access_token: token,
      username: user.name,
      id: user.id,
    };
  }

  async comparePassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async hashPassword(password: string) {
    return bcrypt.hash(password, 10);
  }

  async authenticate(input: LoginDTO) {
    const user = await this.validate(input);
    return await this.signIn(user);
  }
}
