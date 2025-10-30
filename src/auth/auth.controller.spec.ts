import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import type { Request } from 'express';
// import { createId } from '@paralleldrive/cuid2';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokenGuard } from './strategies/refreshToken.guard';
import { AccessTokenGuard } from './strategies/accessToken.guard';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

// const mockedCreateId = createId as jest.Mock;

describe('AuthController', () => {
  let controller: AuthController;
  let mockAuthService: DeepMockProxy<AuthService>;
  let mockRefreshTokenGuard: DeepMockProxy<RefreshTokenGuard>;
  let mockAccessTokenGuard: DeepMockProxy<AccessTokenGuard>;

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
    mockRefreshTokenGuard = module.get(RefreshTokenGuard);
    mockAccessTokenGuard = module.get(AccessTokenGuard);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should allow access and call service when guard passes', async () => {});

  describe('[method] login (POST /login)', () => {
    it('should return a user with token', async () => {
      mockAuthService.authenticate.mockResolvedValue({
        message: 'success',
        statusCode: 200,
        data: {
          id: 'cuid',
          access_token: 'token',
          username: 'test-user',
          refresh_token: 'refresh-token',
        },
      });

      const result = await controller.login({
        email: 'test@mail.co',
        password: 'hashed-password',
      });

      expect(result).toHaveProperty('data.id');
      expect(result).toHaveProperty('data.access_token');
      expect(result).toHaveProperty('data.username');

      expect(result.data.id).toBe('cuid');
      expect(result.data.access_token).toBe('token');
      expect(result.data.username).toBe('test-user');
    });
  });

  describe('[method] register (POST /register)', () => {
    it('should return a user', async () => {
      mockAuthService.register.mockResolvedValue({
        message: 'success',
        statusCode: 200,
        data: {
          id: 'cuid',
          username: 'test-user',
          email: 'test@mail.co',
        },
      });

      const result = await controller.register({
        email: 'test@mail.co',
        password: 'hashed-password',
        username: 'test-user',
      });

      expect(result).toHaveProperty('data.id');
      expect(result).toHaveProperty('data.email');
      expect(result).toHaveProperty('data.username');

      expect(result.data.id).toBe('cuid');
      expect(result.data.email).toBe('test@mail.co');
      expect(result.data.username).toBe('test-user');
    });
  });

  describe('[method] refresh (GET /refresh)', () => {
    it('should return a user with new access token', async () => {
      mockRefreshTokenGuard.canActivate?.mockResolvedValue(true);
      mockAuthService.refresh.mockResolvedValue({
        message: 'success',
        statusCode: 200,
        data: {
          id: 'cuid',
          access_token: 'new-token',
          refresh_token: 'new-refresh-token',
          username: 'test-user',
        },
      });

      const mockReq = {
        headers: {
          authorization: 'Bearer old-refresh-token',
        },
      } as unknown as Request;

      const result = await controller.refresh(mockReq);

      expect(result).toHaveProperty('data.id', 'cuid');
      expect(result).toHaveProperty('data.access_token', 'new-token');
      expect(result).toHaveProperty('data.refresh_token', 'new-refresh-token');
      expect(result).toHaveProperty('data.username', 'test-user');
      expect(result.data.id).toBe('cuid');
      expect(result.data.access_token).toBe('new-token');
      expect(result.data.username).toBe('test-user');
    });
  });

  describe('[method] getMe (GET /me)', () => {
    it('should return user session data', async () => {
      const mockSessionData = {
        statusCode: 200,
        message: 'success',
        data: {
          id: 'cuid',
          name: 'test-user',
          email: 'test@mail.co',
        },
      };

      mockAccessTokenGuard.canActivate?.mockResolvedValue(true);
      mockAuthService.getSession.mockResolvedValue(mockSessionData);

      const mockReq = {
        headers: {
          authorization: 'Bearer some-access-token',
        },
      } as unknown as Request;

      const result = await controller.getMe(mockReq);

      expect(result).toEqual(mockSessionData);
      expect(result.data).toHaveProperty('id', 'cuid');
      expect(result.data).toHaveProperty('name', 'test-user');
      expect(result.data).toHaveProperty('email', 'test@mail.co');
    });
  });
});
