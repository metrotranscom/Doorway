import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MultiselectQuestionsApplicationSectionEnum } from '@prisma/client';
import { randomUUID } from 'crypto';
import { stringify } from 'qs';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../src/modules/app.module';
import { PrismaService } from '../../src/services/prisma.service';
import { multiselectQuestionFactory } from '../../prisma/seed-helpers/multiselect-question-factory';
import { jurisdictionFactory } from '../../prisma/seed-helpers/jurisdiction-factory';
import { MultiselectQuestionCreate } from '../../src/dtos/multiselect-questions/multiselect-question-create.dto';
import { MultiselectQuestionUpdate } from '../../src/dtos/multiselect-questions/multiselect-question-update.dto';
import { IdDTO } from '../../src/dtos/shared/id.dto';
import { MultiselectQuestionQueryParams } from '../../src/dtos/multiselect-questions/multiselect-question-query-params.dto';
import { Compare } from '../../src/dtos/shared/base-filter.dto';
import { userFactory } from '../../prisma/seed-helpers/user-factory';
import { Login } from '../../src/dtos/auth/login.dto';

describe('MultiselectQuestion Controller Tests', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jurisdictionId: string;
  let cookies = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    app.use(cookieParser());
    await app.init();
    const jurisdiction = await prisma.jurisdictions.create({
      data: jurisdictionFactory(),
    });
    jurisdictionId = jurisdiction.id;

    const storedUser = await prisma.userAccounts.create({
      data: await userFactory({
        roles: { isAdmin: true },
        mfaEnabled: false,
        confirmedAt: new Date(),
      }),
    });
    const resLogIn = await request(app.getHttpServer())
      .post('/auth/login')
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

  it('should get multiselect questions from list endpoint when no params are sent', async () => {
    const jurisdictionB = await prisma.jurisdictions.create({
      data: jurisdictionFactory(),
    });

    const multiselectQuestionA = await prisma.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdictionB.id),
    });
    const multiselectQuestionB = await prisma.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdictionB.id),
    });

    const res = await request(app.getHttpServer())
      .get(`/multiselectQuestions?`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(2);
    const multiselectQuestions = res.body.map((value) => value.text);
    expect(multiselectQuestions).toContain(multiselectQuestionA.text);
    expect(multiselectQuestions).toContain(multiselectQuestionB.text);
  });

  it('should get multiselect questions from list endpoint when params are sent', async () => {
    const multiselectQuestionA = await prisma.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdictionId),
    });
    const multiselectQuestionB = await prisma.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdictionId),
    });

    const queryParams: MultiselectQuestionQueryParams = {
      filter: [
        {
          $comparison: Compare['='],
          jurisdiction: jurisdictionId,
        },
      ],
    };
    const query = stringify(queryParams as any);

    const res = await request(app.getHttpServer())
      .get(`/multiselectQuestions?${query}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.length).toBeGreaterThanOrEqual(2);
    const multiselectQuestions = res.body.map((value) => value.text);
    expect(multiselectQuestions).toContain(multiselectQuestionA.text);
    expect(multiselectQuestions).toContain(multiselectQuestionB.text);
  });

  it('should throw error when retrieve endpoint is hit with nonexistent id', async () => {
    const id = randomUUID();
    const res = await request(app.getHttpServer())
      .get(`/multiselectQuestions/${id}`)
      .set('Cookie', cookies)
      .expect(404);
    expect(res.body.message).toEqual(
      `multiselectQuestionId ${id} was requested but not found`,
    );
  });

  it('should get multiselect question when retrieve endpoint is called and id exists', async () => {
    const multiselectQuestionA = await prisma.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdictionId),
    });

    const res = await request(app.getHttpServer())
      .get(`/multiselectQuestions/${multiselectQuestionA.id}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.text).toEqual(multiselectQuestionA.text);
  });

  it('should create a multiselect question', async () => {
    const res = await request(app.getHttpServer())
      .post('/multiselectQuestions')
      .send({
        text: 'example text',
        subText: 'example subText',
        description: 'example description',
        links: [
          {
            title: 'title 1',
            url: 'title 1',
          },
          {
            title: 'title 2',
            url: 'title 2',
          },
        ],
        jurisdictions: [{ id: jurisdictionId }],
        options: [
          {
            text: 'example option text 1',
            ordinal: 1,
            description: 'example option description 1',
            links: [
              {
                title: 'title 3',
                url: 'title 3',
              },
            ],
            collectAddress: true,
            exclusive: false,
          },
          {
            text: 'example option text 2',
            ordinal: 2,
            description: 'example option description 2',
            links: [
              {
                title: 'title 4',
                url: 'title 4',
              },
            ],
            collectAddress: true,
            exclusive: false,
          },
        ],
        optOutText: 'example optOutText',
        hideFromListing: false,
        applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
      } as MultiselectQuestionCreate)
      .set('Cookie', cookies)
      .expect(201);

    expect(res.body.text).toEqual('example text');
  });

  it('should throw error when update endpoint is hit with nonexistent id', async () => {
    const id = randomUUID();
    const res = await request(app.getHttpServer())
      .put(`/multiselectQuestions/${id}`)
      .send({
        id: id,
        text: 'example text',
        subText: 'example subText',
        description: 'example description',
        links: [
          {
            title: 'title 1',
            url: 'title 1',
          },
          {
            title: 'title 2',
            url: 'title 2',
          },
        ],
        jurisdictions: [{ id: jurisdictionId }],
        options: [
          {
            text: 'example option text 1',
            ordinal: 1,
            description: 'example option description 1',
            links: [
              {
                title: 'title 3',
                url: 'title 3',
              },
            ],
            collectAddress: true,
            exclusive: false,
          },
          {
            text: 'example option text 2',
            ordinal: 2,
            description: 'example option description 2',
            links: [
              {
                title: 'title 4',
                url: 'title 4',
              },
            ],
            collectAddress: true,
            exclusive: false,
          },
        ],
        optOutText: 'example optOutText',
        hideFromListing: false,
        applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
      } as MultiselectQuestionUpdate)
      .set('Cookie', cookies)
      .expect(404);
    expect(res.body.message).toEqual(
      `multiselectQuestionId ${id} was requested but not found`,
    );
  });

  it('should update multiselect question', async () => {
    const multiselectQuestionA = await prisma.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdictionId),
    });

    const res = await request(app.getHttpServer())
      .put(`/multiselectQuestions/${multiselectQuestionA.id}`)
      .send({
        id: multiselectQuestionA.id,
        text: 'example text',
        subText: 'example subText',
        description: 'example description',
        links: [
          {
            title: 'title 1',
            url: 'title 1',
          },
          {
            title: 'title 2',
            url: 'title 2',
          },
        ],
        jurisdictions: [{ id: jurisdictionId }],
        options: [
          {
            text: 'example option text 1',
            ordinal: 1,
            description: 'example option description 1',
            links: [
              {
                title: 'title 3',
                url: 'title 3',
              },
            ],
            collectAddress: true,
            exclusive: false,
          },
          {
            text: 'example option text 2',
            ordinal: 2,
            description: 'example option description 2',
            links: [
              {
                title: 'title 4',
                url: 'title 4',
              },
            ],
            collectAddress: true,
            exclusive: false,
          },
        ],
        optOutText: 'example optOutText',
        hideFromListing: false,
        applicationSection: MultiselectQuestionsApplicationSectionEnum.programs,
      } as MultiselectQuestionUpdate)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.text).toEqual('example text');
  });

  it('should throw error when delete endpoint is hit with nonexistent id', async () => {
    const id = randomUUID();
    const res = await request(app.getHttpServer())
      .delete(`/multiselectQuestions`)
      .send({
        id: id,
      } as IdDTO)
      .set('Cookie', cookies)
      .expect(404);
    expect(res.body.message).toEqual(
      `multiselectQuestionId ${id} was requested but not found`,
    );
  });

  it('should delete multiselect question', async () => {
    const multiselectQuestionA = await prisma.multiselectQuestions.create({
      data: multiselectQuestionFactory(jurisdictionId),
    });

    const res = await request(app.getHttpServer())
      .delete(`/multiselectQuestions`)
      .send({
        id: multiselectQuestionA.id,
      } as IdDTO)
      .set('Cookie', cookies)
      .expect(200);

    expect(res.body.success).toEqual(true);
  });
});
