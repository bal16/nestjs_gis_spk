import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { HashService } from './hash.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { Prisma, type User } from '../generated/prisma/client';
import { LoginDTO } from './dto/login.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { LoginUser } from './entities/login.entity';
import { RegisteredUser } from './entities/registered-user.entity';
import { CurrentUser } from './entities/current.entity';

import { UserService } from '../user/user.service';
import { EnvironmentVariables } from '../common/env';
import { JwtPayload } from './entities/jwt-payload.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async validateUser(input: LoginDTO) {
    const user = await this.userService.getOne(input.email);
    // get with credentials

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.hashService.compare(
      input.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async generateToken(user: User): Promise<LoginUser> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const secret = this.configService.get<string>('JWT_SECRET', {
      infer: true,
    });

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', {
      infer: true,
    });

    const token = await this.jwtService.signAsync(payload, { secret });
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });

    await this.userService.update({
      id: user.id,
      token: refreshToken,
    });

    return {
      accessToken: token,
      refreshToken: refreshToken,
      username: user.name,
      id: user.id,
      isAdmin: user.isAdmin,
    };
  }

  async signIn(input: LoginDTO): Promise<LoginUser> {
    const user = await this.validateUser(input);
    const data = await this.generateToken(user);

    return new LoginUser(
      data.accessToken,
      data.refreshToken,
      data.username,
      data.isAdmin,
      data.id,
    );
  }

  async register(input: RegistrationDTO): Promise<RegisteredUser> {
    try {
      const hashedPassword = await this.hashService.hash(input.password);

      const registeredUser = await this.userService.create({
        password: hashedPassword,
        email: input.email,
        name: input.username,
        isAdmin: false,
      });

      return new RegisteredUser(
        registeredUser.id,
        registeredUser.name,
        registeredUser.email,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new BadRequestException('Email already in use');
      }
      throw new InternalServerErrorException(
        'Something went wrong during registration',
      );
    }
  }

  async refresh(refreshToken: string, email: string): Promise<LoginUser> {
    const user = await this.userService.getOne(email);
    // get with credentials

    if (!user || !user.token || user.token !== refreshToken) {
      throw new UnauthorizedException();
    }

    const { accessToken: token, refreshToken: newRefreshToken } =
      await this.generateToken(user);

    return new LoginUser(
      token,
      newRefreshToken,
      user.name,
      user.isAdmin,
      user.id,
    );
  }

  async getSession(email: string): Promise<CurrentUser> {
    const user = await this.userService.getOneWithoutCredentials(email);
    // without credentials
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return new CurrentUser(user.id, user.name, user.email, user.isAdmin);
  }

  async logout(id: string): Promise<null> {
    await this.userService.update({
      id,
      token: null,
    });

    return null;
  }
}
