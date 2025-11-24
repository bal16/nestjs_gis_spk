import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { HttpStatus } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './strategies/refreshToken.guard';
import { AccessTokenGuard } from './strategies/accessToken.guard';
import { LoginDTO } from './dto/login.dto';
import { RegistrationDTO } from './dto/registeration.dto';
import { LoginUser } from './entities/login.entity';
import { RegisteredUser } from './entities/register.entity';
import { CurrentUser } from './entities/current.entity';
import { WebResponse } from '../common/responses/web.response';
import type { CustomRequest } from '../common/type';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: DeepMockProxy<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockDeep<AuthService>())
      .overrideGuard(RefreshTokenGuard)
      .useValue(mockDeep<RefreshTokenGuard>)
      .overrideGuard(AccessTokenGuard)
      .useValue(mockDeep<AccessTokenGuard>)
      .compile();

    controller = module.get(AuthController);
    mockAuthService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('[POST /auth/login]', () => {
    it('should return a user with token', async () => {
      const loginDto: LoginDTO = {
        email: 'test@mail.co',
        password: 'password123',
      };
      const loginUser = new LoginUser(
        'access-token',
        'refresh-token',
        'test-user',
        'user-id',
      );

      mockAuthService.signIn.mockResolvedValue(loginUser);

      const result = await controller.login(loginDto);

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(loginUser);
    });
  });

  describe('[POST /auth/register]', () => {
    it('should return a user', async () => {
      const registerDto: RegistrationDTO = {
        email: 'test@mail.co',
        password: 'password123',
        username: 'test-user',
      };
      const registeredUser = new RegisteredUser(
        'user-id',
        'test-user',
        'test@mail.co',
      );

      mockAuthService.register.mockResolvedValue(registeredUser);

      const result = await controller.register(registerDto);

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.message).toBe('User successfully registered');
      expect(result.data).toEqual(registeredUser);
    });
  });

  describe('[GET /auth/refresh]', () => {
    it('should return a user with new access token', async () => {
      const newLoginUser = new LoginUser(
        'new-access-token',
        'new-refresh-token',
        'test-user',
        'user-id',
      );

      const mockReq = {
        headers: {
          authorization: 'Bearer old-refresh-token',
        },
        user: {
          sub: 'user-id',
          email: 'test@mail.co',
          admin: false,
        },
      } as unknown as CustomRequest;

      mockAuthService.refresh.mockResolvedValue(newLoginUser);

      const result = await controller.refresh(mockReq);

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(newLoginUser);
    });
  });

  describe('[GET /auth/me]', () => {
    it('should return user session data', async () => {
      const currentUser = new CurrentUser(
        'user-id',
        'test-user',
        'test@mail.co',
        null,
        false,
      );

      const mockReq = {
        headers: {
          authorization: 'Bearer some-access-token',
        },
        user: {
          sub: 'user-id',
          email: 'test@mail.co',
          admin: false,
        },
      } as unknown as CustomRequest;

      mockAuthService.getSession.mockResolvedValue(currentUser);

      const result = await controller.getMe(mockReq);

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(currentUser);
    });
  });

  describe('[DELETE /auth/session]', () => {
    it('should call authService.logout with the user id from the request', async () => {
      mockAuthService.logout.mockResolvedValue(null);

      const mockReq = {
        user: {
          sub: 'user-id',
          email: 'test@mail.co',
          admin: false,
        },
      } as unknown as CustomRequest;

      const result = await controller.logout(mockReq);

      expect(result).toBeInstanceOf(WebResponse);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.message).toBe('Success');
      expect(result.data).toBeNull();
    });
  });
});
