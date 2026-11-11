import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from '../infra/database/prisma.service';
import { InvitationService } from './invitation.service';

describe('InvitationService', () => {
  let service: InvitationService;
  let prisma: DeepMockProxy<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationService,
        {
          provide: PrismaService,
          useValue: mockDeep<PrismaService>(),
        },
      ],
    }).compile();

    service = module.get<InvitationService>(InvitationService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prisma).toBeDefined();
  });

  describe('create', () => {
    it('should create an invitation token', async () => {
      const mockResult = {
        id: 'inv-1',
        token: 'mocktoken123',
        email: 'test@example.com',
        role: 'user',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usedAt: null,
        createdAt: new Date(),
      };
      prisma.invitationToken.create.mockResolvedValue(mockResult);

      const result = await service.create({
        email: 'test@example.com',
        role: 'user',
        expiresInDays: 7,
      });

      expect(result).toEqual(mockResult);
      expect(prisma.invitationToken.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all invitation tokens', async () => {
      prisma.invitationToken.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
      expect(prisma.invitationToken.findMany).toHaveBeenCalled();
    });
  });

  describe('validateToken', () => {
    it('should throw NotFoundException if token does not exist', async () => {
      prisma.invitationToken.findUnique.mockResolvedValue(null);
      await expect(service.validateToken('invalid-token')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if token already used', async () => {
      prisma.invitationToken.findUnique.mockResolvedValue({
        id: '1',
        token: 'used-token',
        email: null,
        role: 'user',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: new Date(),
        createdAt: new Date(),
      });
      await expect(service.validateToken('used-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token is expired', async () => {
      prisma.invitationToken.findUnique.mockResolvedValue({
        id: '1',
        token: 'expired-token',
        email: null,
        role: 'user',
        expiresAt: new Date(Date.now() - 100000),
        usedAt: null,
        createdAt: new Date(),
      });
      await expect(service.validateToken('expired-token')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if token email does not match provided email', async () => {
      prisma.invitationToken.findUnique.mockResolvedValue({
        id: '1',
        token: 'email-token',
        email: 'specific@example.com',
        role: 'user',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
        createdAt: new Date(),
      });
      await expect(
        service.validateToken('email-token', 'other@example.com'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should return invitation if token is valid', async () => {
      const mock = {
        id: '1',
        token: 'valid-token',
        email: 'test@example.com',
        role: 'user',
        expiresAt: new Date(Date.now() + 100000),
        usedAt: null,
        createdAt: new Date(),
      };
      prisma.invitationToken.findUnique.mockResolvedValue(mock);
      const result = await service.validateToken(
        'valid-token',
        'test@example.com',
      );
      expect(result).toEqual(mock);
    });
  });

  describe('markAsUsed', () => {
    it('should set usedAt to current date', async () => {
      const mock = {
        id: '1',
        token: 'valid-token',
        email: null,
        role: 'user',
        expiresAt: new Date(),
        usedAt: new Date(),
        createdAt: new Date(),
      };
      prisma.invitationToken.update.mockResolvedValue(mock);
      const result = await service.markAsUsed('1');
      expect(result).toEqual(mock);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if token does not exist', async () => {
      prisma.invitationToken.findUnique.mockResolvedValue(null);
      await expect(service.delete('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should delete token and return true', async () => {
      prisma.invitationToken.findUnique.mockResolvedValue({
        id: '1',
        token: 'valid-token',
        email: null,
        role: 'user',
        expiresAt: new Date(),
        usedAt: null,
        createdAt: new Date(),
      });
      prisma.invitationToken.delete.mockResolvedValue({} as never);
      const result = await service.delete('1');
      expect(result).toBe(true);
    });
  });
});
