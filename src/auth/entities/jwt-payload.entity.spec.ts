import { JwtPayload } from './jwt-payload.entity';

describe('JwtPayload', () => {
  it('should create an instance of JwtPayload', () => {
    const payload = new JwtPayload();
    payload.sub = 'user-id';
    payload.email = 'test@example.com';
    payload.isAdmin = true;

    expect(payload).toBeDefined();
    expect(payload.sub).toBe('user-id');
    expect(payload.email).toBe('test@example.com');
    expect(payload.isAdmin).toBe(true);
  });
});
