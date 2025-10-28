import { Test, TestingModule } from '@nestjs/testing';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
// import { createId } from '@paralleldrive/cuid2';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

// const mockedCreateId = createId as jest.Mock;

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
        message: 'success',
        statusCode: 200,
        data: { id: 'cuid', access_token: 'token', username: 'test-user' },
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
});
