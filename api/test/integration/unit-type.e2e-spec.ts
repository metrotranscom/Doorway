import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { UnitTypeEnum } from '@prisma/client';
import { randomUUID } from 'crypto';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/modules/app.module';
import { PrismaService } from '../../src/services/prisma.service';
import {
  unitTypeFactoryAll,
  unitTypeFactorySingle,
} from '../../prisma/seed-helpers/unit-type-factory';
import { UnitTypeCreate } from '../../src/dtos/unit-types/unit-type-create.dto';
import { UnitTypeUpdate } from '../../src/dtos/unit-types/unit-type-update.dto';
import { IdDTO } from '../../src/dtos/shared/id.dto';
import { userFactory } from '../../prisma/seed-helpers/user-factory';
import { Login } from '../../src/dtos/auth/login.dto';

describe('UnitType Controller Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let cookies = '';
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    app.use(cookieParser());
    await app.init();
    await unitTypeFactoryAll(prisma);

    const storedUser = await prisma.userAccounts.create({
      data: await userFactory({
        roles: { isAdmin: true },
        mfaEnabled: false,
        confirmedAt: new Date(),
      }),
    });
    const resLogIn = await request(app.getHttpServer())
      .post('/auth/login')
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .send({
        email: storedUser.email,
        password: 'abcdef',
      } as Login)
      .expect(201);

    cookies = resLogIn.headers['set-cookie'];
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  it('testing list endpoint', async () => {
    const res = await request(app.getHttpServer())
      .get(`/unitTypes?`)
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .set('Cookie', cookies)
      .expect(200);
    // all unit types are returned
    expect(res.body.length).toBeGreaterThanOrEqual(7);
    // check for random unit types
    const unitTypeNames = res.body.map((value) => value.name);
    expect(unitTypeNames).toContain(UnitTypeEnum.SRO);
    expect(unitTypeNames).toContain(UnitTypeEnum.threeBdrm);
  });

  it("retrieve endpoint with id that doesn't exist should error", async () => {
    const id = randomUUID();
    const res = await request(app.getHttpServer())
      .get(`/unitTypes/${id}`)
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .set('Cookie', cookies)
      .expect(404);
    expect(res.body.message).toEqual(
      `unitTypeId ${id} was requested but not found`,
    );
  });

  it('testing retrieve endpoint', async () => {
    const unitTypeA = await unitTypeFactorySingle(prisma, UnitTypeEnum.oneBdrm);

    const res = await request(app.getHttpServer())
      .get(`/unitTypes/${unitTypeA.id}`)
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.name).toEqual(unitTypeA.name);
  });

  it('testing create endpoint', async () => {
    const name = UnitTypeEnum.twoBdrm;
    const res = await request(app.getHttpServer())
      .post('/unitTypes')
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .send({
        name: name,
        numBedrooms: 10,
      } as UnitTypeCreate)
      .set('Cookie', cookies)
      .expect(201);

    expect(res.body.name).toEqual(name);
  });

  it("update endpoint with id that doesn't exist should error", async () => {
    const id = randomUUID();
    const name = UnitTypeEnum.fourBdrm;
    const res = await request(app.getHttpServer())
      .put(`/unitTypes/${id}`)
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .send({
        id: id,
        name: name,
        numBedrooms: 11,
      } as UnitTypeUpdate)
      .set('Cookie', cookies)
      .expect(404);
    expect(res.body.message).toEqual(
      `unitTypeId ${id} was requested but not found`,
    );
  });

  it('testing update endpoint', async () => {
    const unitTypeA = await unitTypeFactorySingle(prisma, UnitTypeEnum.SRO);
    const name = UnitTypeEnum.SRO;
    const res = await request(app.getHttpServer())
      .put(`/unitTypes/${unitTypeA.id}`)
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .send({
        id: unitTypeA.id,
        name: name,
        numBedrooms: 11,
      } as UnitTypeUpdate)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.name).toEqual(name);
    expect(res.body.numBedrooms).toEqual(11);
  });

  it("delete endpoint with id that doesn't exist should error", async () => {
    const id = randomUUID();
    const res = await request(app.getHttpServer())
      .delete(`/unitTypes`)
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .send({
        id: id,
      } as IdDTO)
      .set('Cookie', cookies)
      .expect(404);
    expect(res.body.message).toEqual(
      `unitTypeId ${id} was requested but not found`,
    );
  });

  it('testing delete endpoint', async () => {
    const createRes = await prisma.unitTypes.create({
      data: {
        name: UnitTypeEnum.fiveBdrm,
        numBedrooms: 6,
      },
    });
    // const unitTypeA = await unitTypeFactorySingle(prisma, UnitTypeEnum.studio);

    const res = await request(app.getHttpServer())
      .delete(`/unitTypes`)
      .set({ passkey: process.env.API_PASS_KEY || '' })
      .send({
        id: createRes.id,
      } as IdDTO)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.success).toEqual(true);
  });
});
