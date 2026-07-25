import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';

import { HashService } from './hash.service';
import { Prisma, User } from '../generated/prisma/client';
import { LoginDTO } from './dto/login.dto';
import { RegistrationDTO } from './dto/registration.dto';
import { ConfigService } from '@nestjs/config';
import { LoginUser } from './entities/login.entity';
import { RegisteredUser } from './entities/registered-user.entity';
import { CurrentUser } from './entities/current.entity';

describe('AuthService', () => {
  let service: AuthService;
  let mockJwtService: DeepMockProxy<JwtService>;
  let mockUserService: DeepMockProxy<UserService>;
  let mockHashService: DeepMockProxy<HashService>;
  let mockConfigService: DeepMockProxy<ConfigService>;

  const mockUser: User = {
    id: 'cuid',
    name: 'test-user',
    email: 'test@mail.co',
    password: '$2a$12$IOMRUtt534W9u8wEl5TBm.iSJZZ3GPcnG.wtJi/jfdDRgGwlbtTXm',
    isAdmin: false,
    token: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const loginTestUser: LoginDTO = {
    email: 'test@mail.co',
    password: 'password123',
  };

  const RegisterTestUser: RegistrationDTO = {
    email: 'test@mail.co',
    username: 'test-user',
    password: 'password123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UserService,
        JwtService,
        ConfigService,
        HashService,
      ],
    })
      .overrideProvider(UserService)
      .useValue(mockDeep<UserService>())
      .overrideProvider(JwtService)
      .useValue(mockDeep<JwtService>())
      .overrideProvider(HashService)
      .useValue(mockDeep<HashService>())
      .overrideProvider(ConfigService)
      .useValue(mockDeep<ConfigService>())
      .compile();

    service = module.get<AuthService>(AuthService);
    mockJwtService = module.get(JwtService);
    mockUserService = module.get(UserService);
    mockHashService = module.get(HashService);
    mockConfigService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('[method] validateUser', () => {
    it('should validate a user', async () => {
      mockUserService.getOne.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(true);

      const result = await service.validateUser(loginTestUser);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('password');

      expect(result).toEqual(mockUser);
    });

    it('should throw an error if user is not found', async () => {
      mockUserService.getOne.mockResolvedValue(null);

      await expect(service.validateUser(loginTestUser)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });

    it('should throw an error if password is incorrect', async () => {
      // Arrange
      mockUserService.getOne.mockResolvedValue({
        ...mockUser,
      });
      mockHashService.compare.mockResolvedValue(false);
      // Act & Assert
      await expect(service.validateUser(loginTestUser)).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });

  describe('[method] generateToken', () => {
    it('should generate access and refresh tokens and update user', async () => {
      const accessToken = 'access-token';
      const refreshToken = 'refresh-token';

      mockConfigService.get
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('jwt-refresh-secret');

      mockJwtService.signAsync
        .mockResolvedValueOnce(accessToken)
        .mockResolvedValueOnce(refreshToken);

      mockUserService.update.mockResolvedValue({
        ...mockUser,
        token: refreshToken,
      });

      const result = await service.generateToken(mockUser);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('id');

      expect(result.username).toBe(mockUser.name);
      expect(result.id).toBe(mockUser.id);
      expect(result.accessToken).toBe(accessToken);
      expect(result.refreshToken).toBe(refreshToken);
    });
  });

  describe('[method] signIn', () => {
    it('should authenticate a user', async () => {
      // This test relies on validateUser, so we mock its dependencies
      mockJwtService.signAsync.mockResolvedValue('token');
      mockConfigService.get.mockReturnValue('secret');
      mockUserService.getOne.mockResolvedValue(mockUser);
      mockHashService.compare.mockResolvedValue(true);

      const result = await service.signIn(loginTestUser);

      expect(result).toBeInstanceOf(LoginUser);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('id');

      expect(result.username).toBe(mockUser.name);
      expect(result.id).toBe(mockUser.id);
      expect(result.accessToken).toBe('token');
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserService.getOne.mockResolvedValue(null); // Simulate user not found

      await expect(service.signIn(loginTestUser)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('[method] register', () => {
    it('should register a user', async () => {
      const hashedPassword = 'hashed-password-from-bcrypt';
      mockUserService.create.mockResolvedValue(mockUser);
      mockUserService.doseExist.mockResolvedValue(false);
      mockHashService.hash.mockResolvedValue(hashedPassword);

      const result = await service.register({
        ...RegisterTestUser,
      });

      expect(result).toBeInstanceOf(RegisteredUser);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('email');

      expect(result.id).toBe('cuid');
      expect(result.username).toBe('test-user');
      expect(result.email).toBe('test@mail.co');
    });

    it('should throw BadRequestException if email is already in use', async () => {
      const hashedPassword = 'hashed-password-from-bcrypt';
      mockHashService.hash.mockResolvedValue(hashedPassword);

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '5.0.0',
        },
      );

      mockUserService.create.mockRejectedValue(prismaError);

      await expect(service.register(RegisterTestUser)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw InternalServerErrorException for other errors', async () => {
      const hashedPassword = 'hashed-password-from-bcrypt';
      mockHashService.hash.mockResolvedValue(hashedPassword);
      mockUserService.create.mockRejectedValue(new Error('Some other error'));

      await expect(service.register(RegisterTestUser)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('[method] refresh', () => {
    it('should refresh a user token', async () => {
      const refreshToken = 'valid-refresh-token';
      const userEmail = 'test@mail.co';
      const newAccessToken = 'new-access-token';
      const newRefreshToken = 'new-refresh-token';

      mockConfigService.get
        .mockReturnValueOnce('jwt-secret')
        .mockReturnValueOnce('jwt-refresh-secret');

      mockUserService.getOne.mockResolvedValue({
        ...mockUser,
        token: refreshToken,
      });

      // Mocking the signIn method which is called internally by refresh
      mockJwtService.signAsync
        .mockResolvedValueOnce(newAccessToken)
        .mockResolvedValueOnce(newRefreshToken);

      mockUserService.update.mockResolvedValue(mockUser);

      const result = await service.refresh(refreshToken, userEmail);

      expect(result).toBeInstanceOf(LoginUser);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('id');

      expect(result.accessToken).toBe(newAccessToken);
      expect(result.refreshToken).toBe(newRefreshToken);
      expect(result.username).toBe(mockUser.name);
      expect(result.id).toBe(mockUser.id);
    });

    it('should throw an UnauthorizedException if user is not found', async () => {
      const refreshToken = 'some-token';
      const userEmail = 'nonexistent@mail.co';

      mockUserService.getOne.mockResolvedValue(null);

      await expect(service.refresh(refreshToken, userEmail)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if stored token does not match', async () => {
      const incomingToken = 'incoming-refresh-token';
      const storedToken = 'different-stored-token';
      const userEmail = 'test@mail.co';

      mockUserService.getOne.mockResolvedValue({
        ...mockUser,
        token: storedToken,
      });

      await expect(service.refresh(incomingToken, userEmail)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw an UnauthorizedException if user has no token stored', async () => {
      mockUserService.getOne.mockResolvedValue({
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
      const mockUserWithoutCredentials: Omit<User, 'password' | 'token'> = {
        id: 'cuid',
        name: 'test-user',
        email: 'test@mail.co',
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserService.getOneWithoutCredentials.mockResolvedValue(
        mockUserWithoutCredentials,
      );

      const result = await service.getSession(mockUserWithoutCredentials.email);

      expect(result).toBeInstanceOf(CurrentUser);
      expect(result.id).toBe(mockUser.id);
      expect(result.name).toBe(mockUser.name);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const email = 'no-user@mail.co';
      mockUserService.getOneWithoutCredentials.mockResolvedValue(null);

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

      expect(result).toBeNull();
    });
  });
});
