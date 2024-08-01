import {
  Body,
  Controller,
  Get,
  Header,
  Put,
  Query,
  Request,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest, Response } from 'express';
import { LotteryService } from '../services/lottery.service';
import { defaultValidationPipeOptions } from '../utilities/default-validation-pipe-options';
import { SuccessDTO } from '../dtos/shared/success.dto';
import { OptionalAuthGuard } from '../guards/optional.guard';
import { ActivityLogInterceptor } from '../interceptors/activity-log.interceptor';
import { PermissionTypeDecorator } from '../decorators/permission-type.decorator';
import { ApplicationCsvQueryParams } from '../dtos/applications/application-csv-query-params.dto';
import { ExportLogInterceptor } from '../interceptors/export-log.interceptor';
import { ApiKeyGuard } from '../guards/api-key.guard';

@Controller('lottery')
@ApiTags('lottery')
@UsePipes(new ValidationPipe(defaultValidationPipeOptions))
@PermissionTypeDecorator('lottery')
@UseGuards(ApiKeyGuard, OptionalAuthGuard)
@UseInterceptors(ActivityLogInterceptor)
export class LotteryController {
  constructor(private readonly lotteryService: LotteryService) {}

  @Put(`generateLotteryResults`)
  @ApiOperation({
    summary: 'Generate the lottery results for a listing',
    operationId: 'lotteryGenerate',
  })
  @UseInterceptors(ExportLogInterceptor)
  async lotteryGenerate(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @Body() queryParams: ApplicationCsvQueryParams,
  ): Promise<SuccessDTO> {
    return await this.lotteryService.lotteryGenerate(req, res, queryParams);
  }

  @Get(`getLotteryResults`)
  @ApiOperation({
    summary: 'Get applications lottery results',
    operationId: 'lotteryResults',
  })
  @Header('Content-Type', 'application/zip')
  @UseInterceptors(ExportLogInterceptor)
  async lotteryExport(
    @Request() req: ExpressRequest,
    @Res({ passthrough: true }) res: Response,
    @Query(new ValidationPipe(defaultValidationPipeOptions))
    queryParams: ApplicationCsvQueryParams,
  ): Promise<StreamableFile> {
    return await this.lotteryService.lotteryExport(req, res, queryParams);
  }
}
