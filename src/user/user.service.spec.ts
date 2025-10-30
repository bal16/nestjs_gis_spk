import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../infra/database/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import type { User } from '../../generated/prisma';

describe('UserService', () => {
  let service: UserService;
  let mockPrismaService: DeepMockProxy<PrismaService>;

  const mockUser: User = {
    id: 'cuid',
    name: 'test-user',
    email: 'test@mail.co',
    password: 'hashed-password',
    token: null,
    isAdmin: false,
    avatar: 'avatar.jpg',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    service = module.get<UserService>(UserService);

    mockPrismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mockPrismaService).toBeDefined();
  });

  describe('[method] getOneByEmailOrName', () => {
    it('should get a user by email and exclude credentials by default', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getOneByEmailOrName('test@mail.co');

      expect(result).toBe(mockUser);
    });

    it('should get a user by name and exclude credentials when specified', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getOneByEmailOrName('test-user', true);

      expect(result).toBe(mockUser);
    });

    it('should get a user by email and include credentials when specified', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getOneByEmailOrName('test@mail.co', false);

      expect(result).toBe(mockUser);
    });

    it('should return null if no user is found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.getOneByEmailOrName('nonexistent@mail.co');

      expect(result).toBeNull();
    });
  });

  describe('[method] create', () => {
    it('should create a new user', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('[method] update', () => {
    it('should update a user', async () => {
      const updatePayload = { id: mockUser.id, name: 'updated-name' };
      const updatedUser = { ...mockUser, name: 'updated-name' };

      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(updatePayload);

      expect(result).toEqual(updatedUser);
    });
  });
});
