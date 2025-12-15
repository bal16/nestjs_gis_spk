import { Injectable } from '@nestjs/common';
import { User, type Prisma } from 'generated/prisma';
import { PrismaService } from '../infra/database/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getOneWithoutCredentials(
    emailOrName: string,
  ): Promise<Omit<User, 'password' | 'token'> | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrName }, { name: emailOrName }],
      },
      omit: {
        password: true,
        token: true,
      },
    });
  }

  async getOne(emailOrName: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrName }, { name: emailOrName }],
      },
    });
  }

  async doseExist(emailOrName: string): Promise<boolean> {
    return Boolean(
      await this.prisma.user.findFirst({
        where: {
          OR: [{ email: emailOrName }, { name: emailOrName }],
        },
        select: {
          id: true,
        },
      }),
    );
  }

  async create(user: Prisma.UserCreateInput): Promise<User> {
    return await this.prisma.user.create({
      data: user,
    });
  }

  async update(user: User | Partial<User>): Promise<User | Partial<User>> {
    const { id, ...rest } = user;
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: rest,
    });
  }
}
