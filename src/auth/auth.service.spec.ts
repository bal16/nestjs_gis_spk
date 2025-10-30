import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';

import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

import { User } from '../../generated/prisma';
import { LoginDTO } from './dto/login.dto';
import { RegistrationDTO } from './dto/registeration.dto';
import { ConfigService } from '@nestjs/config';

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
    token: null,
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
      providers: [AuthService, UserService, JwtService, ConfigService],
    })
      .overrideProvider(UserService)
      .useValue(mockDeep<UserService>())
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
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

  describe('[method] refresh', () => {
    it('should refresh a user token', async () => {
      const refreshToken = 'valid-refresh-token';
      const userEmail = 'test@mail.co';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      mockUserService.getOneByEmailOrName.mockResolvedValue({
        ...mockUser,
        token: refreshToken,
      });

      // Mocking the signIn method which is called internally by refresh
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);

      mockUserService.update.mockResolvedValue(mockUser);

      const result = await service.refresh(refreshToken, userEmail);

      expect(result).toHaveProperty('data.access_token');
      expect(result).toHaveProperty('data.refresh_token');
      expect(result).toHaveProperty('data.username');
      expect(result).toHaveProperty('data.id');

      expect(result.data.access_token).toBe(newAccessToken);
      expect(result.data.refresh_token).toBe(newRefreshToken);
      expect(result.data.username).toBe(mockUser.name);
      expect(result.data.id).toBe(mockUser.id);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      const refreshToken = 'some-token';
      const userEmail = 'nonexistent@mail.co';

      mockUserService.getOneByEmailOrName.mockResolvedValue(null);

      await expect(service.refresh(refreshToken, userEmail)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if stored token does not match', async () => {
      const incomingToken = 'incoming-refresh-token';
      const storedToken = 'different-stored-token';
      const userEmail = 'test@mail.co';

      mockUserService.getOneByEmailOrName.mockResolvedValue({
        ...mockUser,
        token: storedToken,
      });

      await expect(service.refresh(incomingToken, userEmail)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if user has no token stored', async () => {
      mockUserService.getOneByEmailOrName.mockResolvedValue({
        ...mockUser,
        token: null,
      });

      await expect(
        service.refresh('some-token', mockUser.email),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('[method] getSession', () => {
    it('should return user data for a valid email', async () => {
      mockUserService.getOneByEmailOrName.mockResolvedValue(mockUser);

      const result = await service.getSession(mockUser.email);

      expect(result).toEqual({
        statusCode: 200,
        message: 'success',
        data: mockUser,
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const email = 'no-user@mail.co';
      mockUserService.getOneByEmailOrName.mockResolvedValue(null);

      await expect(service.getSession(email)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('[method] logout', () => {
    it('should log out a user by clearing their refresh token', async () => {
      const userId = 'cuid';

      mockUserService.update.mockResolvedValue({ ...mockUser, token: null });

      const result = await service.logout(userId);

      expect(result).toEqual({
        statusCode: 200,
        message: 'success',
        data: null,
      });
    });
  });
});
