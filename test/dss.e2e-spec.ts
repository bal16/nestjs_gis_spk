import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/infra/database/prisma.service';
import { createId } from '@paralleldrive/cuid2';
import type { WebResponse } from '../src/common/responses/web.response';
import type {
  SawRun,
  SawRunDetail,
  WeightConfiguration,
} from '../src/generated/prisma/client';

jest.mock('@paralleldrive/cuid2', () => ({
  createId: jest.fn(),
}));

const mockedCreateId = createId as jest.Mock;
let idCounter = 1;
mockedCreateId.mockImplementation(() => `id-cuid2-dss-mock-${idCounter++}`);

describe('DssModule', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;

  const testUser = {
    email: 'dss_test@example.com',
    username: 'dss_test',
    password: 'password123',
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

    // Seed Data: Create a building with an assessment for DSS calculation to process
    await prisma.building.create({
      data: {
        code: 'DSS-E2E-B1',
        name: 'DSS E2E Building',
        latitude: -6.2,
        longitude: 106.816666,
        assessments: {
          create: {
            age: 10,
            structure: 3,
            architecture: 3,
            mep: 3,
            utility: 200,
            damage: 2,
            lastMaintenance: new Date('2023-01-01'),
          },
        },
      },
    });

    // Seed Data: Provide initial weights if none exist (assuming standard test setup)
    const existingWeights = await prisma.weightConfiguration.count();
    if (existingWeights === 0) {
      await prisma.weightConfiguration.createMany({
        data: [
          { key: 'c1', type: 'benefit', value: 0.2, name: 'Age' },
          { key: 'c2', type: 'benefit', value: 0.2, name: 'Structure' },
          { key: 'c21', type: 'benefit', value: 0.33, name: 'Architecture' },
          { key: 'c22', type: 'benefit', value: 0.33, name: 'MEP' },
          { key: 'c23', type: 'benefit', value: 0.34, name: 'Utility' },
          { key: 'c3', type: 'benefit', value: 0.2, name: 'Utility' },
          { key: 'c4', type: 'cost', value: 0.2, name: 'Damage' },
          { key: 'c5', type: 'benefit', value: 0.2, name: 'Maintenance' },
        ],
      });
    }
  });

  afterAll(async () => {
    // Clean up
    await prisma.sawRunDetail.deleteMany();
    await prisma.sawRun.deleteMany();
    await prisma.assessment.deleteMany();
    await prisma.building.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('/dss', () => {
    let createdRunId: string;
    let createdRunDetailId: string;

    describe('GET /dss/weights', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer()).get('/dss/weights').expect(401);
      });

      it('should retrieve weights', async () => {
        const res = await request(app.getHttpServer())
          .get('/dss/weights')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect(
          Array.isArray((res.body as WebResponse<WeightConfiguration[]>).data),
        ).toBe(true);
      });
    });

    describe('PUT /dss/weights', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .put('/dss/weights')
          .send({ weights: [] })
          .expect(401);
      });

      it('should reject invalid payload (total weights sum !== 1.0) with 400', async () => {
        return request(app.getHttpServer())
          .put('/dss/weights')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ weights: [{ key: 'c1', value: 99, subWeights: [] }] }) // Total > 1.0
          .expect(400);
      });

      it('should update weights', async () => {
        const getRes = await request(app.getHttpServer())
          .get('/dss/weights')
          .set('Authorization', `Bearer ${accessToken}`);

        const weightsData = (getRes.body as WebResponse<WeightConfiguration[]>)
          .data;

        // Pass the same weights back to test update workflow since they are already valid and sum to 1.0
        const updateDto = {
          weights: weightsData.map(
            (
              w: WeightConfiguration & { subWeights?: WeightConfiguration[] },
            ) => ({
              key: w.key,
              value: w.value,
              subWeights: w.subWeights
                ? w.subWeights.map((sw: WeightConfiguration) => ({
                    key: sw.key,
                    value: sw.value,
                  }))
                : [],
            }),
          ),
        };

        const res = await request(app.getHttpServer())
          .put('/dss/weights')
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updateDto)
          .expect(200);

        expect((res.body as WebResponse<boolean>).data).toBe(true);
      });
    });

    describe('POST /dss/calculate', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer()).post('/dss/calculate').expect(401);
      });

      it('should calculate and save results', async () => {
        const res = await request(app.getHttpServer())
          .post('/dss/calculate')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200); // Controller uses @HttpCode(HttpStatus.OK)

        expect((res.body as WebResponse<boolean>).data).toBe(true);
      });
    });

    describe('GET /dss/runs', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer()).get('/dss/runs').expect(401);
      });

      it('should retrieve all runs', async () => {
        const res = await request(app.getHttpServer())
          .get('/dss/runs')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        type ResultType = SawRun & { sawRunDetails: SawRunDetail[] };

        const body = res.body as WebResponse<ResultType[]>;

        expect(Array.isArray(body.data)).toBe(true);
        expect(body.data.length).toBeGreaterThan(0);

        // Store the ids for subsequent operations
        createdRunId = body.data[0].id;
        createdRunDetailId = body.data[0].sawRunDetails[0].id;
      });
    });

    describe('GET /dss/runs/lastest', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .get('/dss/runs/lastest')
          .expect(401);
      });

      it('should retrieve the latest run', async () => {
        const res = await request(app.getHttpServer())
          .get('/dss/runs/lastest')
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect((res.body as WebResponse<{ id: string }>).data).toHaveProperty(
          'id',
          createdRunId,
        );
      });
    });

    describe('GET /dss/runs/:id', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .get('/dss/runs/some-id')
          .expect(401);
      });

      it('should retrieve run by id', async () => {
        const res = await request(app.getHttpServer())
          .get(`/dss/runs/${createdRunId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect((res.body as WebResponse<{ id: string }>).data).toHaveProperty(
          'id',
          createdRunId,
        );
      });
    });

    describe('DELETE /dss/run/details/:id', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .delete('/dss/run/details/some-id')
          .expect(401);
      });

      it('should delete a run detail', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/dss/run/details/${createdRunDetailId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect((res.body as WebResponse<boolean>).data).toBe(true);
      });
    });

    describe('DELETE /dss/run/:id', () => {
      it('should reject unauthenticated requests', () => {
        return request(app.getHttpServer())
          .delete('/dss/run/some-id')
          .expect(401);
      });

      it('should delete a run', async () => {
        const res = await request(app.getHttpServer())
          .delete(`/dss/run/${createdRunId}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200);

        expect((res.body as WebResponse<boolean>).data).toBe(true);
      });
    });
  });
});
