import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

import type { User } from '../../generated/prisma';
import type { LoginDTO } from './dto/login.dto';

describe('AuthService', () => {
  let service: AuthService;
  let mockJwtService: DeepMockProxy<JwtService>;
  let mockUserService: DeepMockProxy<UserService>;

  const mockUser: User = {
    id: 'cuid',
    name: 'test-user',
    email: 'test@mail.co',
    password: 'hashed-password',
    isAdmin: false,
    avatar: 'avatar.jpg',
  };

  const loginTestUser: LoginDTO = {
    email: 'test@mail.co',
    password: 'hashed-password',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, UserService, JwtService],
    })
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
      .overrideProvider(UserService)
      .useValue(mockDeep<UserService>())
      .compile();

    service = module.get<AuthService>(AuthService);
    mockJwtService = module.get(JwtService);
    mockUserService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(mockJwtService).toBeDefined();
    expect(mockUserService).toBeDefined();
  });

  it('should validate a user', async () => {
    mockUserService.getOneByEmail.mockResolvedValue(mockUser);

    const result = await service.validate(loginTestUser);

    expect(result).toBe(mockUser);
  });

  it('should sign in a user', async () => {
    mockJwtService.signAsync.mockResolvedValue('token');
    const result = await service.signIn(mockUser);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('id');
  });

  it('should authenticate a user', async () => {
    mockJwtService.signAsync.mockResolvedValue('token');
    mockUserService.getOneByEmail.mockResolvedValue(mockUser);

    const result = await service.authenticate(loginTestUser);

    expect(result).toHaveProperty('access_token');
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('id');
  });
});
