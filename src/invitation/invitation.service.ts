import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../infra/database/prisma.service';
import { CreateInvitationDTO } from './dto/create-invitation.dto';
import type { InvitationToken } from '../generated/prisma/client';

@Injectable()
export class InvitationService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInvitationDTO): Promise<InvitationToken> {
    const token = crypto.randomBytes(16).toString('hex');
    const days = dto.expiresInDays ?? 7;
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    return await this.prisma.invitationToken.create({
      data: {
        token,
        email: dto.email ? dto.email.toLowerCase().trim() : null,
        role: dto.role ?? 'user',
        expiresAt,
      },
    });
  }

  async findAll(): Promise<InvitationToken[]> {
    return await this.prisma.invitationToken.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneByToken(token: string): Promise<InvitationToken | null> {
    return await this.prisma.invitationToken.findUnique({
      where: { token },
    });
  }

  async validateToken(
    token: string,
    email?: string,
  ): Promise<InvitationToken> {
    const invitation = await this.findOneByToken(token);

    if (!invitation) {
      throw new NotFoundException('Invitation token is invalid');
    }

    if (invitation.usedAt) {
      throw new BadRequestException('Invitation token has already been used');
    }

    if (new Date() > invitation.expiresAt) {
      throw new BadRequestException('Invitation token has expired');
    }

    if (
      invitation.email &&
      email &&
      invitation.email.toLowerCase() !== email.toLowerCase().trim()
    ) {
      throw new BadRequestException(
        'Invitation token is restricted to another email address',
      );
    }

    return invitation;
  }

  async markAsUsed(id: string): Promise<InvitationToken> {
    return await this.prisma.invitationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async delete(id: string): Promise<boolean> {
    const exists = await this.prisma.invitationToken.findUnique({
      where: { id },
    });

    if (!exists) {
      throw new NotFoundException('Invitation token not found');
    }

    await this.prisma.invitationToken.delete({
      where: { id },
    });

    return true;
  }
}
