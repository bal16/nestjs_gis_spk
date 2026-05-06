import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import type { WebResponse } from '../src/common/responses/web.response';
import type { Assessment, Building } from '../src/generated/prisma/client';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

const mockedCreateId = createId as jest.Mock;
let idCounter = 1;
mockedCreateId.mockImplementation(() => `id-cuid2-mock-${idCounter++}`);

describe('BuildingModule', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;

  const testUser = {
    email: 'building_test@example.com',
    username: 'building_test',
    password: 'password123',
  };

  const testBuilding = {
    code: 'B-E2E-01',
    name: 'E2E Building',
    latitude: -6.2,
    longitude: 106.816666,
  };

  const testAssessment = {
    age: 5,
    structure: 4,
    architecture: 3,
    mep: 4,
    utility: 5,
    damage: 2,
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.useLogger(false);
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);

    // Register and login test user
    await request(app.getHttpServer()).post('/auth/register').send(testUser);

    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    accessToken = (res.body as WebResponse<{ accessToken: string }>).data
      .accessToken;
  });

  afterAll(async () => {
    await prisma.assessment.deleteMany();
    await prisma.building.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/buildings', () => {
    let createdBuildingId: string;
    let createdAssessmentId: string;

    describe('POST /buildings', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .post('/buildings')
          .send(testBuilding)
          .expect(401);
      });

      it('should reject invalid payload (400)', () => {
        return request(app.getHttpServer())
          .post('/buildings')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ code: 123, name: '' }) // Invalid types/empty
          .expect(400);
      });

      it('should create a new building', async () => {
        const res = await request(app.getHttpServer())
          .post('/buildings')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testBuilding)
          .expect(201);

        const body = res.body as WebResponse<{
          id: string;
          code: string;
        }>;

        expect(body.data).toHaveProperty('id');
        expect(body.data.code).toBe(testBuilding.code);
        createdBuildingId = body.data.id;
      });
    });

    describe('GET /buildings', () => {
      it('should retrieve all buildings', async () => {
        const res = await request(app.getHttpServer())
          .get('/buildings')
          .expect(200);

        const body = res.body as WebResponse<Building[]>;
        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);
        expect(
          body.data.some((b: Building) => b.code === testBuilding.code),
        ).toBe(true);
      });
    });

    describe('PUT /buildings/:id', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .put('/buildings/some-id')
          .send({ name: 'updated' })
          .expect(401);
      });

      it('should update the building', async () => {
        const updateData = { name: 'E2E Building Updated' };
        const res = await request(app.getHttpServer())
          .put(`/buildings/${createdBuildingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateData)
          .expect(200);

        const body = res.body as WebResponse<{
          name: string;
        }>;

        expect(body.data.name).toBe(updateData.name);
      });
    });

    describe('POST /buildings/:code/assessments', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .post(`/buildings/${testBuilding.code}/assessments`)
          .send(testAssessment)
          .expect(401);
      });

      it('should reject invalid payload (400)', () => {
        return request(app.getHttpServer())
          .post(`/buildings/${testBuilding.code}/assessments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ age: 'not-a-number' }) // Invalid type
          .expect(400);
      });

      it('should create an assessment', async () => {
        const res = await request(app.getHttpServer())
          .post(`/buildings/${testBuilding.code}/assessments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(testAssessment)
          .expect(201);

        const body = res.body as WebResponse<{
          id: string;
        }>;

        expect(body.data).toHaveProperty('id');
        createdAssessmentId = body.data.id;
      });
    });

    describe('GET /buildings/:code/assessments', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .get(`/buildings/${testBuilding.code}/assessments`)
          .expect(401);
      });

      it('should retrieve assessments for a building', async () => {
        const res = await request(app.getHttpServer())
          .get(`/buildings/${testBuilding.code}/assessments`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        const body = res.body as WebResponse<{
          id: string;
          code: string;
          assessments: Assessment[];
        }>;

        expect(body.data.code).toBe(testBuilding.code);
        expect(Array.isArray(body.data.assessments)).toBe(true);
        expect(
          body.data.assessments.some(
            (a: Assessment) => a.id === createdAssessmentId,
          ),
        ).toBe(true);
      });
    });

    describe('PUT /buildings/:code/assessments/:assessmentId', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .put(`/buildings/${testBuilding.code}/assessments/some-id`)
          .send({ age: 10 })
          .expect(401);
      });

      it('should update an assessment', async () => {
        const updateAssessmentData = { age: 10 };
        const res = await request(app.getHttpServer())
          .put(
            `/buildings/${testBuilding.code}/assessments/${createdAssessmentId}`,
          )
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateAssessmentData)
          .expect(200);

        const body = res.body as WebResponse<{
          id: string;
          code: string;
          age: string;
          assessments: Assessment[];
        }>;

        expect(body.data.age).toBe(updateAssessmentData.age);
      });
    });

    describe('DELETE /buildings/assessments/:assessmentId', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .delete('/buildings/assessments/some-id')
          .expect(401);
      });

      it('should delete an assessment', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/buildings/assessments/${createdAssessmentId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        const body = res.body as WebResponse<boolean>;

        expect(body.data).toBeDefined();
      });
    });

    describe('DELETE /buildings/:id', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .delete('/buildings/some-id')
          .expect(401);
      });

      it('should delete the building', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/buildings/${createdBuildingId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        const body = res.body as WebResponse<boolean>;

        expect(body.data).toBeDefined();
      });
    });
  });
});
