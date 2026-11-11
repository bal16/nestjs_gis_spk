import {
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(() => {
    guard = new AdminGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  const createMockExecutionContext = (user?: {
    isAdmin: boolean;
  }): ExecutionContext => {
    const mockRequest = { user };
    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  };

  it('should allow access if user is admin', () => {
    const context = createMockExecutionContext({ isAdmin: true });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw ForbiddenException if user is not admin', () => {
    const context = createMockExecutionContext({ isAdmin: false });
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('should throw UnauthorizedException if user is not present on request', () => {
    const context = createMockExecutionContext(undefined);
    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });
});
