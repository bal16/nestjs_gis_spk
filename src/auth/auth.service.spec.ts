import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

import type { User } from '../../generated/prisma';
import type { LoginDTO } from './dto/login.dto';
import type { RegistrationDTO } from './dto/registeration.dto';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

const mockedCreateId = createId as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;
  let mockJwtService: DeepMockProxy<JwtService>;
  let mockUserService: DeepMockProxy<UserService>;

  const mockUser: User = {
    id: 'cuid',
    name: 'test-user',
    email: 'test@mail.co',
    password: '$2a$12$IOMRUtt534W9u8wEl5TBm.iSJZZ3GPcnG.wtJi/jfdDRgGwlbtTXm',
    isAdmin: false,
    avatar: 'avatar.jpg',
  };

  const loginTestUser: LoginDTO = {
    email: 'test@mail.co',
    password: 'hashed-password',
  };

  const RegisterTestUser: RegistrationDTO = {
    email: 'test@mail.co',
    username: 'test-user',
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
    mockedCreateId.mockReturnValue('id-cuid2-palsu-12345');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('[method] validate', () => {
    it('should validate a user', async () => {
      mockUserService.getOneByEmailOrName.mockResolvedValue(mockUser);

      const result = await service.validate(loginTestUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('password');

      expect(result).toBe(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      mockUserService.getOneByEmailOrName.mockResolvedValue(null);

      await expect(service.validate(loginTestUser)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw an error if password is incorrect', async () => {
      mockUserService.getOneByEmailOrName.mockResolvedValue({
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
      mockUserService.getOneByEmailOrName.mockResolvedValue(mockUser);

      const result = await service.authenticate(loginTestUser);

      expect(result).toHaveProperty('data.access_token');
      expect(result).toHaveProperty('data.username');
      expect(result).toHaveProperty('data.id');

      expect(result.data.username).toBe(mockUser.name);
      expect(result.data.id).toBe(mockUser.id);
      expect(result.data.access_token).toBe('token');
    });
  });

  describe('[method] register', () => {
    it('should register a user', async () => {
      mockUserService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        username: 'test-user',
        email: 'test@mail.co',
        password: 'hashed-password',
      });

      expect(result).toHaveProperty('data.id');
      expect(result).toHaveProperty('data.username');
      expect(result).toHaveProperty('data.email');

      expect(result.data.id).toBe('id-cuid2-palsu-12345');
      expect(result.data.username).toBe('test-user');
      expect(result.data.email).toBe('test@mail.co');
    });

    it('should throw an error if user already exists', async () => {
      mockUserService.getOneByEmailOrName.mockResolvedValue(mockUser);

      await expect(service.register(RegisterTestUser)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
