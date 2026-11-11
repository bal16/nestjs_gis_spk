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
import { ChangePasswordDTO } from './dto/change-password.dto';
import { LoginUser } from './entities/login.entity';
import { RegisteredUser } from './entities/registered-user.entity';
import { CurrentUser } from './entities/current.entity';

import { UserService } from '../user/user.service';
import { PrismaService } from '../infra/database/prisma.service';
import { EnvironmentVariables } from '../common/env';
import { JwtPayload } from './entities/jwt-payload.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly prisma: PrismaService,
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
      mustChangePassword: user.mustChangePassword,
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
      mustChangePassword: user.mustChangePassword,
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
      data.mustChangePassword,
    );
  }

  async register(input: RegistrationDTO): Promise<RegisteredUser> {
    const invitation = await this.prisma.invitationToken.findUnique({
      where: { token: input.invitationToken },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid invitation token');
    }

    if (invitation.usedAt) {
      throw new BadRequestException('Invitation token has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation token has expired');
    }

    if (
      invitation.email &&
      invitation.email.toLowerCase() !== input.email.toLowerCase().trim()
    ) {
      throw new BadRequestException(
        'Invitation token is restricted to another email address',
      );
    }

    try {
      const hashedPassword = await this.hashService.hash(input.password);

      const registeredUser = await this.userService.create({
        password: hashedPassword,
        email: input.email,
        name: input.username,
        isAdmin: invitation.role === 'admin',
        mustChangePassword: false,
      });

      await this.prisma.invitationToken.update({
        where: { id: invitation.id },
        data: { usedAt: new Date() },
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
      if (error instanceof BadRequestException) {
        throw error;
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
      user.mustChangePassword,
    );
  }

  async getSession(email: string): Promise<CurrentUser> {
    const user = await this.userService.getOneWithoutCredentials(email);
    // without credentials
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return new CurrentUser(
      user.id,
      user.name,
      user.email,
      user.isAdmin,
      user.mustChangePassword,
    );
  }

  async changePassword(id: string, dto: ChangePasswordDTO): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await this.hashService.compare(
      dto.oldPassword,
      user.password,
    );

    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    if (dto.oldPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await this.hashService.hash(dto.newPassword);

    await this.userService.update({
      id: user.id,
      password: hashedPassword,
      mustChangePassword: false,
    });

    return true;
  }

  async logout(id: string): Promise<null> {
    await this.userService.update({
      id,
      token: null,
    });

    return null;
  }
}
