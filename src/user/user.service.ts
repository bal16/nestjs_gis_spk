import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from '../infra/database/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getOneByEmailOrName(input: string): Promise<User | null> {
    return await this.prisma.user.findFirst({
      where: {
        OR: [{ email: input }, { name: input }],
      },
    });
  }
}
