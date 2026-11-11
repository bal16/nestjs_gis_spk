import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma.service';
import type { WebResponse } from '../src/common/responses/web.response';
import type { InvitationToken } from '../src/generated/prisma/client';

describe('InvitationModule (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let regularUserToken: string;

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

    // 1. Create admin user
    await prisma.invitationToken.create({
      data: {
        token: 'initial-admin-token',
        role: 'admin',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await request(app.getHttpServer()).post('/auth/register').send({
      username: 'adminuser',
      email: 'admin@e2e.test',
      password: 'password123',
      invitationToken: 'initial-admin-token',
    });

    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@e2e.test', password: 'password123' });

    adminToken = (
      adminLoginRes.body as WebResponse<{ accessToken: string }>
    ).data.accessToken;

    // 2. Create regular user
    await prisma.invitationToken.create({
      data: {
        token: 'initial-regular-token',
        role: 'user',
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    await request(app.getHttpServer()).post('/auth/register').send({
      username: 'regularuser',
      email: 'user@e2e.test',
      password: 'password123',
      invitationToken: 'initial-regular-token',
    });

    const userLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@e2e.test', password: 'password123' });

    regularUserToken = (
      userLoginRes.body as WebResponse<{ accessToken: string }>
    ).data.accessToken;
  });

  afterAll(async () => {
    await prisma.invitationToken.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('POST /invitations', () => {
    it('should reject unauthenticated requests (401)', () => {
      return request(app.getHttpServer())
        .post('/invitations')
        .send({ role: 'user' })
        .expect(401);
    });

    it('should reject non-admin users with 403 Forbidden', () => {
      return request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ role: 'user' })
        .expect(403);
    });

    it('should allow admin to create an invitation token (201)', async () => {
      const res = await request(app.getHttpServer())
        .post('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'invitee@e2e.test', role: 'user', expiresInDays: 5 })
        .expect(201);

      const body = res.body as WebResponse<InvitationToken>;
      expect(body.data).toHaveProperty('token');
      expect(body.data.email).toBe('invitee@e2e.test');
      expect(body.data.role).toBe('user');
    });
  });

  describe('GET /invitations', () => {
    it('should reject unauthenticated requests (401)', () => {
      return request(app.getHttpServer()).get('/invitations').expect(401);
    });

    it('should reject non-admin users (403)', () => {
      return request(app.getHttpServer())
        .get('/invitations')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should allow admin to retrieve all invitations (200)', async () => {
      const res = await request(app.getHttpServer())
        .get('/invitations')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const body = res.body as WebResponse<InvitationToken[]>;
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('GET /invitations/validate/:token', () => {
    it('should validate a valid invitation token publicly (200)', async () => {
      const created = await prisma.invitationToken.create({
        data: {
          token: 'public-valid-token',
          role: 'user',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      const res = await request(app.getHttpServer())
        .get(`/invitations/validate/${created.token}`)
        .expect(200);

      const body = res.body as WebResponse<{ valid: boolean; role: string }>;
      expect(body.data.valid).toBe(true);
      expect(body.data.role).toBe('user');
    });

    it('should return 404 for a non-existent token', () => {
      return request(app.getHttpServer())
        .get('/invitations/validate/non-existent-token-xyz')
        .expect(404);
    });

    it('should return 400 for an expired token', async () => {
      await prisma.invitationToken.create({
        data: {
          token: 'expired-token-xyz',
          role: 'user',
          expiresAt: new Date(Date.now() - 1000 * 60),
        },
      });

      return request(app.getHttpServer())
        .get('/invitations/validate/expired-token-xyz')
        .expect(400);
    });
  });

  describe('DELETE /invitations/:id', () => {
    it('should reject non-admin users (403)', async () => {
      const token = await prisma.invitationToken.create({
        data: {
          token: 'to-delete-token',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      return request(app.getHttpServer())
        .delete(`/invitations/${token.id}`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(403);
    });

    it('should allow admin to delete an invitation token (200)', async () => {
      const token = await prisma.invitationToken.create({
        data: {
          token: 'to-delete-token-admin',
          expiresAt: new Date(Date.now() + 1000 * 60 * 60),
        },
      });

      return request(app.getHttpServer())
        .delete(`/invitations/${token.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });
});
