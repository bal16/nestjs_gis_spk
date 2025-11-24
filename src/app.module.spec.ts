import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user/user.service';
import { PrismaService } from './infra/database/prisma.service';
import { createId } from '@paralleldrive/cuid2';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

const mockedCreateId = createId as jest.Mock;

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      // We override providers from imported modules to avoid their complex dependencies (like DB connections)
      .overrideProvider(UserService)
      .useValue({})
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({})
      .compile();

    mockedCreateId.mockReturnValue('id-cuid2-palsu-12345');
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import ConfigModule, PrismaModule, UserModule, and AuthModule', () => {
    expect(module.get(ConfigService)).toBeDefined();
    expect(module.get(PrismaService)).toBeDefined();
    expect(module.get(UserService)).toBeDefined();
  });

  it('should provide AppService', () => {
    const appService = module.get<AppService>(AppService);
    expect(appService).toBeDefined();
  });

  it('should provide AppController', () => {
    const appController = module.get<AppController>(AppController);
    expect(appController).toBeDefined();
  });
});
