import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma.service';
import { createId } from '@paralleldrive/cuid2';
// import type { WebResponse } from 'src/common/type';
import type { JwtPayload } from 'src/auth/dto/jwt.dto';
import type { WebResponse } from 'src/common/responses/web.response';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

const mockedCreateId = createId as jest.Mock;

mockedCreateId.mockReturnValue('id-cuid2-palsu-12345');

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    email: 'test@example.com',
    username: 'testuser',
    password: 'password123',
  };

  describe('/auth/register (POST)', () => {
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

      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
    });

    it('should log in a user and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password })
        .expect(200)
        .then((res) => {
          const body = res.body as WebResponse<{
            access_token: string;
            refresh_token: string;
          }>;
          expect(body.data).toHaveProperty('access_token');
          expect(body.data).toHaveProperty('refresh_token');
        });
    });

    it('should not log in with invalid credentials and return 401', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' })
        .expect(401);
    });
  });

  describe('Authenticated routes', () => {
    let accessToken: string;
    let refreshToken: string;

    type AuthRouteResponseBody = WebResponse<{
      access_token: string;
      refresh_token: string;
    }>;

    beforeEach(async () => {
      await request(app.getHttpServer()).post('/auth/register').send(testUser);
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: testUser.email, password: testUser.password });
      const body = res.body as AuthRouteResponseBody;
      accessToken = body.data.access_token;
      refreshToken = body.data.refresh_token;
    });

    it('/auth/me (GET) - should get user profile', () => {
      return request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200)
        .then((res) => {
          expect((res.body as WebResponse<JwtPayload>).data.email).toBe(
            testUser.email,
          );
        });
    });

    it('/auth/refresh (GET) - should refresh tokens', () => {
      return request(app.getHttpServer())
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`)
        .expect(200)
        .then((res) => {
          const body = res.body as AuthRouteResponseBody;
          expect(body.data).toHaveProperty('access_token');
          expect(body.data).toHaveProperty('refresh_token');
        });
    });

    it('/auth/session (DELETE) - should log out user', () => {
      return request(app.getHttpServer())
        .delete('/auth/session')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
    });
  });
});
