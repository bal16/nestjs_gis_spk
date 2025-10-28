import { Injectable } from '@nestjs/common';
import { User } from 'generated/prisma';
import { PrismaService } from '../infra/database/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getOneByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }
}
