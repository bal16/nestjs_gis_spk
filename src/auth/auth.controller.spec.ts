import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

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
      .compile();

    controller = module.get<AuthController>(AuthController);
    mockAuthService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('[method] login (POST /login)', () => {
    it('should return a user with token', async () => {
      mockAuthService.authenticate.mockResolvedValue({
        id: 'cuid',
        access_token: 'token',
        username: 'test-user',
      });

      const result = await controller.login({
        email: 'test@mail.co',
        password: 'hashed-password',
      });

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('username');

      expect(result.id).toBe('cuid');
      expect(result.access_token).toBe('token');
      expect(result.username).toBe('test-user');
    });
  });
});
