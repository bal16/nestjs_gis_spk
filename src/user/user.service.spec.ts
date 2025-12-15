import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../infra/database/prisma.service';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import type { User } from '../generated/prisma/client';

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
  };

  const mockUserWithoutCredentials: Omit<User, 'password' | 'token'> = {
    id: 'cuid',
    name: 'test-user',
    email: 'test@mail.co',
    isAdmin: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaService>())
      .compile();

    mockPrismaService = module.get(PrismaService);

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mockPrismaService).toBeDefined();
  });

  describe('[method] getOneWithoutCredentials', () => {
    it('should get a user by email and exclude credentials', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(
        mockUserWithoutCredentials as unknown as User,
      );

      const result = await service.getOneWithoutCredentials('test@mail.co');

      expect(result).toEqual(mockUserWithoutCredentials);
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('token');
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.getOneWithoutCredentials('not-found');

      expect(result).toBeNull();
    });
  });

  describe('[method] getOne', () => {
    it('should get a user by email with credentials', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.getOne('test@mail.co');

      expect(result).toEqual(mockUser);
    });

    it('should return null if user is not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.getOne('not-found');

      expect(result).toBeNull();
    });
  });

  describe('[method] doseUserExist', () => {
    it('should return true if user exists', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.doseExist('test@mail.co');

      expect(result).toBe(true);
    });

    it('should return false if user does not exist', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      const result = await service.doseExist('not-found');

      expect(result).toBe(false);
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
