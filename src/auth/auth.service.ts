import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import type { User } from '../../generated/prisma';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validate(input: LoginDTO) {
    const user = await this.userService.getOneByEmail(input.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    if (user.password !== input.password) {
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

  async authenticate(input: LoginDTO) {
    const user = await this.validate(input);
    return await this.signIn(user);
  }
}
