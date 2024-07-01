import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { Request as ExpressRequest } from 'express';
import { ScriptRunnerService } from '../../../src/services/script-runner.service';
import { PrismaService } from '../../../src/services/prisma.service';
import { User } from '../../../src/dtos/users/user.dto';
import { AmiChartService } from '../../../src/services/ami-chart.service';

describe('Testing script runner service', () => {
  let service: ScriptRunnerService;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScriptRunnerService,
        PrismaService,
        Logger,
        SchedulerRegistry,
        AmiChartService,
      ],
    }).compile();

    service = module.get<ScriptRunnerService>(ScriptRunnerService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // because of how doorway ci env variables work we can't publicly expose a db for us to connect to
  it.skip('should transfer data', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'data transfer';

    const res = await service.dataTransfer(
      {
        user: {
          id,
        } as unknown as User,
      } as unknown as ExpressRequest,
      {
        connectionString: process.env.TEST_CONNECTION_STRING,
      },
    );

    expect(res.success).toBe(true);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
  });

  it('should build ami chart import object', async () => {
    const id = randomUUID();
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);
    prisma.amiChart.create = jest.fn().mockResolvedValue(null);

    const name = 'example name';
    const scriptName = `AMI Chart ${name}`;
    const jurisdictionId = 'example jurisdictionId';
    const valueItem =
      '15 18400 21000 23650 26250 28350 30450 32550 34650\n30 39150 44750 50350 55900 60400 64850 69350 73800\n50 65250 74600 83900 93200 100700 108150 115600 123050';
    const res = await service.amiChartImport(
      {
        user: {
          id,
        } as unknown as User,
      } as unknown as ExpressRequest,
      {
        values: valueItem,
        name,
        jurisdictionId,
      },
    );
    expect(res.success).toEqual(true);
    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
    expect(prisma.amiChart.create).toHaveBeenCalledWith({
      data: {
        name,
        items: [
          {
            percentOfAmi: 15,
            householdSize: 1,
            income: 18400,
          },
          {
            percentOfAmi: 15,
            householdSize: 2,
            income: 21000,
          },
          {
            percentOfAmi: 15,
            householdSize: 3,
            income: 23650,
          },
          {
            percentOfAmi: 15,
            householdSize: 4,
            income: 26250,
          },
          {
            percentOfAmi: 15,
            householdSize: 5,
            income: 28350,
          },
          {
            percentOfAmi: 15,
            householdSize: 6,
            income: 30450,
          },
          {
            percentOfAmi: 15,
            householdSize: 7,
            income: 32550,
          },
          {
            percentOfAmi: 15,
            householdSize: 8,
            income: 34650,
          },
          {
            percentOfAmi: 30,
            householdSize: 1,
            income: 39150,
          },
          {
            percentOfAmi: 30,
            householdSize: 2,
            income: 44750,
          },
          {
            percentOfAmi: 30,
            householdSize: 3,
            income: 50350,
          },
          {
            percentOfAmi: 30,
            householdSize: 4,
            income: 55900,
          },
          {
            percentOfAmi: 30,
            householdSize: 5,
            income: 60400,
          },
          {
            percentOfAmi: 30,
            householdSize: 6,
            income: 64850,
          },
          {
            percentOfAmi: 30,
            householdSize: 7,
            income: 69350,
          },
          {
            percentOfAmi: 30,
            householdSize: 8,
            income: 73800,
          },
          {
            percentOfAmi: 50,
            householdSize: 1,
            income: 65250,
          },
          {
            percentOfAmi: 50,
            householdSize: 2,
            income: 74600,
          },
          {
            percentOfAmi: 50,
            householdSize: 3,
            income: 83900,
          },
          {
            percentOfAmi: 50,
            householdSize: 4,
            income: 93200,
          },
          {
            percentOfAmi: 50,
            householdSize: 5,
            income: 100700,
          },
          {
            percentOfAmi: 50,
            householdSize: 6,
            income: 108150,
          },
          {
            percentOfAmi: 50,
            householdSize: 7,
            income: 115600,
          },
          {
            percentOfAmi: 50,
            householdSize: 8,
            income: 123050,
          },
        ],
        jurisdictions: {
          connect: {
            id: jurisdictionId,
          },
        },
      },
      include: {
        jurisdictions: true,
      },
    });
  });

  // | ---------- HELPER TESTS BELOW ---------- | //
  it('should mark script run as started if no script run present in db', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue(null);
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt';

    await service.markScriptAsRunStart(scriptName, {
      id,
    } as unknown as User);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).toHaveBeenCalledWith({
      data: {
        scriptName,
        triggeringUser: id,
      },
    });
  });

  it('should error if script run is in progress or failed', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue({
      id: randomUUID(),
      didScriptRun: false,
    });
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 2';

    await expect(
      async () =>
        await service.markScriptAsRunStart(scriptName, {
          id,
        } as unknown as User),
    ).rejects.toThrowError(
      `${scriptName} has an attempted run and it failed, or is in progress. If it failed, please delete the db entry and try again`,
    );

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).not.toHaveBeenCalled();
  });

  it('should error if script run already succeeded', async () => {
    prisma.scriptRuns.findUnique = jest.fn().mockResolvedValue({
      id: randomUUID(),
      didScriptRun: true,
    });
    prisma.scriptRuns.create = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 3';

    await expect(
      async () =>
        await service.markScriptAsRunStart(scriptName, {
          id,
        } as unknown as User),
    ).rejects.toThrowError(`${scriptName} has already been run and succeeded`);

    expect(prisma.scriptRuns.findUnique).toHaveBeenCalledWith({
      where: {
        scriptName,
      },
    });
    expect(prisma.scriptRuns.create).not.toHaveBeenCalled();
  });

  it('should mark script run as started if no script run present in db', async () => {
    prisma.scriptRuns.update = jest.fn().mockResolvedValue(null);

    const id = randomUUID();
    const scriptName = 'new run attempt 4';

    await service.markScriptAsComplete(scriptName, {
      id,
    } as unknown as User);

    expect(prisma.scriptRuns.update).toHaveBeenCalledWith({
      data: {
        didScriptRun: true,
        triggeringUser: id,
      },
      where: {
        scriptName,
      },
    });
  });
});
