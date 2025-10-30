import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from '../infra/database/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getOneByEmailOrName(
    input: string,
    credentials: boolean = true,
  ): Promise<User | Partial<User> | null> {
    const select = {
      id: true,
      name: true,
      email: true,
      avatar: true,
      isAdmin: true,
      token: true,
      password: true,
    };

    if (!credentials) {
      select.password = false;
      select.token = false;
    }

    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input }, { name: input }],
      },
      select,
    });
  }

  async create(user: User): Promise<User | Partial<User>> {
    return await this.prisma.user.create({
      data: user,
    });
  }

  async update(user: User | Partial<User>): Promise<User | Partial<User>> {
    return await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: user,
    });
  }
}
