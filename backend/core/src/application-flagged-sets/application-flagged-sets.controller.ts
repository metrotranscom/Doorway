import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common"
import { Request as ExpressRequest } from "express"
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger"
import { ResourceType } from "../auth/decorators/resource-type.decorator"
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard"
import { AuthzGuard } from "../auth/guards/authz.guard"
import { defaultValidationPipeOptions } from "../shared/default-validation-pipe-options"
import { mapTo } from "../shared/mapTo"
import { StatusDto } from "../shared/dto/status.dto"
import { ApplicationFlaggedSetsService } from "./application-flagged-sets.service"
import { ApplicationFlaggedSetDto } from "./dto/application-flagged-set.dto"
import { PaginatedApplicationFlaggedSetDto } from "./dto/paginated-application-flagged-set.dto"
import { ApplicationFlaggedSetResolveDto } from "./dto/application-flagged-set-resolve.dto"
import { PaginatedApplicationFlaggedSetQueryParams } from "./paginated-application-flagged-set-query-params"
import { ApplicationFlaggedSetsCronjobService } from "./application-flagged-sets-cronjob.service"
import { ApplicationFlaggedSetMeta } from "./dto/application-flagged-set-meta.dto"
import { IdDto } from "../shared/dto/id.dto"

@Controller("/applicationFlaggedSets")
@ApiTags("applicationFlaggedSets")
@ApiBearerAuth()
@ResourceType("applicationFlaggedSet")
@UseGuards(OptionalAuthGuard, AuthzGuard)
@UsePipes(
  new ValidationPipe({
    ...defaultValidationPipeOptions,
  })
)
export class ApplicationFlaggedSetsController {
  constructor(
    private readonly applicationFlaggedSetsService: ApplicationFlaggedSetsService,
    private readonly afsProcessingService: ApplicationFlaggedSetsCronjobService
  ) { }

  @Get("meta")
  @ApiOperation({ summary: "Meta information for application flagged sets", operationId: "meta" })
  async meta(
    @Query() queryParams: PaginatedApplicationFlaggedSetQueryParams
  ): Promise<ApplicationFlaggedSetMeta> {
    return await this.applicationFlaggedSetsService.meta(queryParams)
  }

  @Get()
  @ApiOperation({ summary: "List application flagged sets", operationId: "list" })
  async list(
    @Query() queryParams: PaginatedApplicationFlaggedSetQueryParams
  ): Promise<PaginatedApplicationFlaggedSetDto> {
    return mapTo(
      PaginatedApplicationFlaggedSetDto,
      await this.applicationFlaggedSetsService.listPaginated(queryParams)
    )
  }

  @Get(`:afsId`)
  @ApiOperation({ summary: "Retrieve application flagged set by id", operationId: "retrieve" })
  async retrieve(@Param("afsId") afsId: string): Promise<ApplicationFlaggedSetDto> {
    return mapTo(
      ApplicationFlaggedSetDto,
      await this.applicationFlaggedSetsService.findOneById(afsId)
    )
  }

  @Post("resolve")
  @ApiOperation({ summary: "Resolve application flagged set", operationId: "resolve" })
  async resolve(
    @Request() req: ExpressRequest,
    @Body() dto: ApplicationFlaggedSetResolveDto
  ): Promise<ApplicationFlaggedSetDto> {
    return mapTo(ApplicationFlaggedSetDto, await this.applicationFlaggedSetsService.resolve(dto))
  }

  @Put(":afsId")
  @ApiOperation({
    summary: "Reset flagged set confirmation alert",
    operationId: "resetConfirmationAlert",
  })
  async resetConfirmationAlert(@Body() dto: IdDto): Promise<StatusDto> {
    await this.applicationFlaggedSetsService.resetConfirmationAlert(dto.id)
    return mapTo(StatusDto, { status: "ok" })
  }

  @Post("process")
  @ApiOperation({ summary: "Trigger the duplicate check process", operationId: "process" })
  async process(): Promise<string> {
    await this.afsProcessingService.process()
    return "success"
  }
}
