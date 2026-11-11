import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma.service';
import { createId } from '@paralleldrive/cuid2';
// import type { WebResponse } from 'src/common/type';
import type { JwtPayload } from '../src/auth/dto/jwt.dto';
import type { WebResponse } from '../src/common/responses/web.response';
// import { PrismaPg } from '@prisma/adapter-pg';
// import { PrismaClient } from '../src/generated/prisma/client';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL!,
// });

// const prismaClient = new PrismaClient({
//   adapter,
// });

const mockedCreateId = createId as jest.Mock;

mockedCreateId.mockReturnValue('id-cuid2-palsu-12345');

describe('AuthModule', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useLogger(false);
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  beforeEach(async () => {
    await prisma.invitationToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.invitationToken.create({
      data: {
        token: 'test-invitation-token',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });
  });

  afterEach(async () => {
    await prisma.invitationToken.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
    invitationToken: 'test-invitation-token',
  };

  type AuthRouteResponseBody = WebResponse<{
    accessToken: string;
    refreshToken: string;
  }>;

  describe('POST /auth/register', () => {
    it('should reject invalid payload (400)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ email: 'not-an-email', username: '', password: '12' }) // Invalid payload
        .expect(400);
    });

    it('should register a new user and return 201', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .then((res) => {
          expect((res.body as WebResponse<JwtPayload>).data).toEqual({
            id: expect.any(String) as string,
            username: testUser.username,
            email: testUser.email,
          });
        });
    });

    it('should not register a user with an existing email and return 400', async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);

      await prisma.invitationToken.create({
        data: {
          token: 'another-token',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, invitationToken: 'another-token' })
        .expect(400);
    });

    it('should reject registration without invitation token (400)', () => {
      const { invitationToken: _, ...userWithoutToken } = testUser;
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(userWithoutToken)
        .expect(400);
    });

    it('should reject registration with invalid invitation token (400)', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, invitationToken: 'non-existent-token' })
        .expect(400);
    });

    it('should reject registration with expired invitation token (400)', async () => {
      await prisma.invitationToken.create({
        data: {
          token: 'expired-token',
          expiresAt: new Date(Date.now() - 1000 * 60),
        },
      });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, invitationToken: 'expired-token' })
        .expect(400);
    });

    it('should reject registration when token is restricted to another email (400)', async () => {
      await prisma.invitationToken.create({
        data: {
          token: 'restricted-token',
          email: 'other@example.com',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...testUser, invitationToken: 'restricted-token' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
    });

    it('should reject invalid payload (400)', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'not-an-email', password: '' }) // Invalid payload
        .expect(400);
    });

    it('should not log in with invalid credentials and return 401', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should log in a user and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .then((res) => {
          const body = res.body as WebResponse<{
            accessToken: string;
            refreshToken: string;
          }>;
          expect(body.data).toHaveProperty('accessToken');
          expect(body.data).toHaveProperty('refreshToken');
        });
    });
  });

  describe('GET /auth/me', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      const body = res.body as AuthRouteResponseBody;
      accessToken = body.data.accessToken;
    });

    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer()).get('/auth/me').expect(401);
    });

    it('should get user profile', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          const body = res.body as WebResponse<{ email: string }>;
          expect(body.data.email).toBe(testUser.email);
        });
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      const body = res.body as AuthRouteResponseBody;
      refreshToken = body.data.refreshToken;
    });

    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer()).post('/auth/refresh').expect(401);
    });

    it('should refresh tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200)
        .then((res) => {
          const body = res.body as AuthRouteResponseBody;
          expect(body.data).toHaveProperty('accessToken');
          expect(body.data).toHaveProperty('refreshToken');
        });
    });
  });

  describe('DELETE /auth/session', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      const body = res.body as AuthRouteResponseBody;
      accessToken = body.data.accessToken;
    });

    it('should reject unauthenticated requests', () => {
      return request(app.getHttpServer()).delete('/auth/session').expect(401);
    });

    it('should log out user', () => {
      return request(app.getHttpServer())
        .delete('/auth/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });

  describe('POST /auth/change-password', () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      const body = res.body as AuthRouteResponseBody;
      accessToken = body.data.accessToken;
    });

    it('should reject unauthenticated request (401)', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .send({ oldPassword: 'password123', newPassword: 'newpassword123' })
        .expect(401);
    });

    it('should reject change password if old password does not match (400)', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: 'wrongpassword', newPassword: 'newpassword123' })
        .expect(400);
    });

    it('should reject change password if new password is identical to old password (400)', () => {
      return request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: testUser.password, newPassword: testUser.password })
        .expect(400);
    });

    it('should change password successfully and allow login with new password', async () => {
      await request(app.getHttpServer())
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ oldPassword: testUser.password, newPassword: 'brandNewPassword123' })
        .expect(200);

      // Verify old password fails
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(401);

      // Verify new password succeeds
      const newLogin = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'brandNewPassword123' })
        .expect(200);

      const body = newLogin.body as AuthRouteResponseBody;
      expect(body.data).toHaveProperty('accessToken');
    });
  });
});
