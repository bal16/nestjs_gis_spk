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

  it('should get a user by email', async () => {
    mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

    const result = await service.getOneByEmailOrName('test@mail.co');

    expect(result).toBe(mockUser);
  });
});
