import { Test, TestingModule } from '@nestjs/testing';
import { UserModule } from './user.module';
import { UserService } from './user.service';
import { PrismaService } from '../infra/database/prisma.service';

describe('UserModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [UserModule],
    })
      .overrideProvider(PrismaService)
      .useValue({}) // We provide a mock/dummy value for PrismaService
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide and export UserService', () => {
    const userService = module.get<UserService>(UserService);
    expect(userService).toBeDefined();
    // A simple check to ensure it's an instance of UserService
    expect(userService).toBeInstanceOf(UserService);
  });
});
