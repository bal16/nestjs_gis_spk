import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { PrismaPg } from '@prisma/adapter-pg';

// Mock the Prisma Pg adapter so it doesn't try to connect to an actual database
jest.mock('@prisma/adapter-pg', () => {
  return {
    PrismaPg: jest.fn().mockImplementation(() => ({})),
  };
});

// Mock the generated PrismaClient so it doesn't look for the schema/engine during testing
jest.mock('../../generated/prisma/client', () => {
  return {
    PrismaClient: class {
      constructor(public options: any) {}
    },
  };
});

describe('PrismaService', () => {
  let service: PrismaService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        {
          provide: ConfigService,
          useValue: {
            get: jest
              .fn()
              .mockReturnValue(
                'postgres://user:password@localhost:5432/testdb',
              ),
          },
        },
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should initialize PrismaPg adapter with the correct connection string from ConfigService', () => {
    expect(service).toBeDefined();
    // expect(configService.get).toHaveBeenCalledWith('DATABASE_URL');
    expect(PrismaPg).toHaveBeenCalledWith({
      connectionString: 'postgres://user:password@localhost:5432/testdb',
    });
  });
});
