import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

import type { User } from '../../generated/prisma';
import type { LoginDTO } from './dto/login.dto';
import { UnauthorizedException } from '@nestjs/common';

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
  });

  describe('[method] validate', () => {
    it('should validate a user', async () => {
      mockUserService.getOneByEmail.mockResolvedValue(mockUser);

      const result = await service.validate(loginTestUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('password');

      expect(result).toBe(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      mockUserService.getOneByEmail.mockResolvedValue(null);

      await expect(service.validate(loginTestUser)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw an error if password is incorrect', async () => {
      mockUserService.getOneByEmail.mockResolvedValue({
        ...mockUser,
        password: 'wrong-password',
      });

      await expect(service.validate(loginTestUser)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('[method] signIn', () => {
    it('should sign in a user', async () => {
      mockJwtService.signAsync.mockResolvedValue('token');
      const result = await service.signIn(mockUser);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('id');

      expect(result.username).toBe(mockUser.name);
      expect(result.id).toBe(mockUser.id);
      expect(result.access_token).toBe('token');
    });
  });

  describe('[method] authenticate', () => {
    it('should authenticate a user', async () => {
      mockJwtService.signAsync.mockResolvedValue('token');
      mockUserService.getOneByEmail.mockResolvedValue(mockUser);

      const result = await service.authenticate(loginTestUser);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('id');

      expect(result.username).toBe(mockUser.name);
      expect(result.id).toBe(mockUser.id);
      expect(result.access_token).toBe('token');
    });
  });
});
