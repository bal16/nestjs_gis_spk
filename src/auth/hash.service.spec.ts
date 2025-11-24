import { Test, TestingModule } from '@nestjs/testing';
import { HashService } from './hash.service';
import * as bcrypt from 'bcrypt';

// Mock the bcrypt library
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('HashService', () => {
  let service: HashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HashService],
    }).compile();

    service = module.get<HashService>(HashService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('compare', () => {
    it('should call bcrypt.compare with the correct arguments', async () => {
      const password = 'testpassword';
      const hash = 'hashedpassword';
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.compare(password, hash);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hash);
    });

    it('should return true if passwords match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.compare('testpassword', 'hashedpassword');

      expect(result).toBe(true);
    });

    it('should return false if passwords do not match', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.compare('wrongpassword', 'hashedpassword');

      expect(result).toBe(false);
    });
  });

  describe('hash', () => {
    it('should call bcrypt.hash with the correct password and salt rounds', async () => {
      const password = 'testpassword';
      const saltRounds = 10;
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');

      await service.hash(password);

      expect(bcrypt.hash).toHaveBeenCalledWith(password, saltRounds);
      const result = await service.hash(password);
      expect(result).toBe('hashedpassword');
    });
  });
});
