import { Test, TestingModule } from '@nestjs/testing';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { AccessTokenGuard } from '../auth/strategies/accessToken.guard';
import { AdminGuard } from '../auth/strategies/admin.guard';

describe('InvitationController', () => {
  let controller: InvitationController;
  let service: DeepMockProxy<InvitationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvitationController],
      providers: [
        {
          provide: InvitationService,
          useValue: mockDeep<InvitationService>(),
        },
      ],
    })
      .overrideGuard(AccessTokenGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InvitationController>(InvitationController);
    service = module.get(InvitationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it('should call service.create on create', async () => {
    const dto = { email: 'test@example.com', role: 'user', expiresInDays: 7 };
    const mockToken = {
      id: '1',
      token: 'abc',
      email: 'test@example.com',
      role: 'user',
      expiresAt: new Date(),
      usedAt: null,
      createdAt: new Date(),
    };
    service.create.mockResolvedValue(mockToken);

    const response = await controller.create(dto);
    expect(response.data).toEqual(mockToken);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll on findAll', async () => {
    service.findAll.mockResolvedValue([]);
    const response = await controller.findAll();
    expect(response.data).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.validateToken on validate', async () => {
    const mockToken = {
      id: '1',
      token: 'abc',
      email: 'test@example.com',
      role: 'user',
      expiresAt: new Date(),
      usedAt: null,
      createdAt: new Date(),
    };
    service.validateToken.mockResolvedValue(mockToken);

    const response = await controller.validate('abc');
    expect(response.data).toEqual({
      valid: true,
      email: 'test@example.com',
      role: 'user',
    });
    expect(service.validateToken).toHaveBeenCalledWith('abc');
  });

  it('should call service.delete on delete', async () => {
    service.delete.mockResolvedValue(true);
    const response = await controller.delete('1');
    expect(response.data).toBe(true);
    expect(service.delete).toHaveBeenCalledWith('1');
  });
});
