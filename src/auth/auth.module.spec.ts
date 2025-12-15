import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HashService } from './hash.service';
import { PrismaService } from '../infra/database/prisma.service';

describe('AuthModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        AuthModule,
        ConfigModule.forRoot({ isGlobal: true }), // ensure ConfigService is provided
      ],
    })
      .overrideProvider(UserService)
      .useValue({})
      .overrideProvider(JwtService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({ get: () => undefined })
      .overrideProvider(HashService)
      .useValue({})
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide AuthService', () => {
    const authService = module.get<AuthService>(AuthService);
    expect(authService).toBeDefined();
    expect(authService).toBeInstanceOf(AuthService);
  });

  it('should provide AuthController', () => {
    const authController = module.get<AuthController>(AuthController);
    expect(authController).toBeDefined();
    expect(authController).toBeInstanceOf(AuthController);
  });
});
