import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RefreshTokenGuard } from './refreshToken.guard';
import { JwtPayload } from '../entities/jwt-payload.entity';

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;
  let mockJwtService: DeepMockProxy<JwtService>;
  let mockConfigService: DeepMockProxy<ConfigService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenGuard,
        {
          provide: JwtService,
          useValue: mockDeep<JwtService>(),
        },
        {
          provide: ConfigService,
          useValue: mockDeep<ConfigService>(),
        },
      ],
    }).compile();

    guard = module.get<RefreshTokenGuard>(RefreshTokenGuard);
    mockJwtService = module.get(JwtService);
    mockConfigService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockExecutionContext = (
    headers: Record<string, string>,
  ): ExecutionContext => {
    const mockRequest = {
      headers,
      user: undefined,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should return true and attach user to request for a valid token', async () => {
      const token = 'valid-refresh-token';
      const payload: JwtPayload = {
        sub: 'user-id',
        email: 'test@test.com',
        isAdmin: false,
      };
      const mockContext = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });
      const request = mockContext
        .switchToHttp()
        .getRequest<Request & { user: JwtPayload }>();

      mockConfigService.get.mockReturnValue('test-refresh-secret');
      mockJwtService.verifyAsync.mockResolvedValue(payload);

      const result = await guard.canActivate(mockContext);

      expect(result).toBe(true);
      expect(request.user).toEqual(payload);
    });

    it('should throw UnauthorizedException if no token is provided', async () => {
      const mockContext = createMockExecutionContext({});

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token verification fails', async () => {
      const token = 'invalid-refresh-token';
      const mockContext = createMockExecutionContext({
        authorization: `Bearer ${token}`,
      });

      mockConfigService.get.mockReturnValue('test-refresh-secret');
      mockJwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(guard.canActivate(mockContext)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
