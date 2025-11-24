import { JwtPayload } from './jwt.dto';

describe('JwtPayload', () => {
  it('should create a JwtPayload instance and assign properties correctly', () => {
    const payloadData = {
      sub: 'user-id-123',
      email: 'test@example.com',
      admin: false,
    };

    const payload = new JwtPayload();
    payload.sub = payloadData.sub;
    payload.email = payloadData.email;
    payload.admin = payloadData.admin;

    expect(payload).toBeInstanceOf(JwtPayload);
    expect(payload.sub).toBe(payloadData.sub);
    expect(payload.email).toBe(payloadData.email);
    expect(payload.admin).toBe(payloadData.admin);
  });

  it('should hold correct values for different user types', () => {
    const adminPayload: JwtPayload = {
      sub: 'admin-id-456',
      email: 'admin@example.com',
      admin: true,
    };

    expect(adminPayload.admin).toBe(true);
  });
});
