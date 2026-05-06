import { JwtPayload } from './jwt.dto';

describe('JwtPayload', () => {
  it('should create a JwtPayload instance and assign properties correctly', () => {
    const payloadData = {
      sub: 'user-id-123',
      email: 'test@example.com',
      isAdmin: false,
    };

    const payload = new JwtPayload();
    payload.sub = payloadData.sub;
    payload.email = payloadData.email;
    payload.isAdmin = payloadData.isAdmin;

    expect(payload).toBeInstanceOf(JwtPayload);
    expect(payload.sub).toBe(payloadData.sub);
    expect(payload.email).toBe(payloadData.email);
    expect(payload.isAdmin).toBe(payloadData.isAdmin);
  });

  it('should hold correct values for different user types', () => {
    const adminPayload: JwtPayload = {
      sub: 'admin-id-456',
      email: 'admin@example.com',
      isAdmin: true,
    };

    expect(adminPayload.isAdmin).toBe(true);
  });
});
