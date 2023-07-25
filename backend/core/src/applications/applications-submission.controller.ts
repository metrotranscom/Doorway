import { Body, Controller, Post, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common"
import { ApiBearerAuth, ApiExtraModels, ApiOperation, ApiTags } from "@nestjs/swagger"
import { ResourceType } from "../auth/decorators/resource-type.decorator"
import { OptionalAuthGuard } from "../auth/guards/optional-auth.guard"
import { ApplicationDto } from "./dto/application.dto"
import { mapTo } from "../shared/mapTo"
import { defaultValidationPipeOptions } from "../shared/default-validation-pipe-options"
import { ResourceAction } from "../auth/decorators/resource-action.decorator"
import { AuthzGuard } from "../auth/guards/authz.guard"
import { ValidationsGroupsEnum } from "../shared/types/validations-groups-enum"
import { ThrottlerGuard } from "@nestjs/throttler"
import { applicationMultiselectQuestionApiExtraModels } from "./types/application-multiselect-question-api-extra-models"
import { authzActions } from "../auth/enum/authz-actions.enum"
import { ApplicationsService } from "./services/applications.service"
import { ApplicationCreateDto } from "./dto/application-create.dto"

@Controller("applications")
@ApiTags("applications")
@ApiBearerAuth()
@ResourceType("application")
@UseGuards(OptionalAuthGuard, AuthzGuard, ThrottlerGuard)
@UsePipes(
  new ValidationPipe({
    ...defaultValidationPipeOptions,
    groups: [ValidationsGroupsEnum.default, ValidationsGroupsEnum.applicants],
  })
)
@ApiExtraModels(...applicationMultiselectQuestionApiExtraModels)
export class ApplicationsSubmissionController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post(`submit`)
  @ApiOperation({ summary: "Submit application", operationId: "submit" })
  @ResourceAction(authzActions.submit)
  async submit(@Body() applicationCreateDto: ApplicationCreateDto): Promise<ApplicationDto> {
    const application = await this.applicationsService.submit(applicationCreateDto)
    return mapTo(ApplicationDto, application)
  }

  @Post("verify")
  @ApiOperation({ summary: "Verify application can be saved", operationId: "submissionValidation" })
  @ResourceAction(authzActions.submit)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  submissionValidation(@Body() applicationDraft: ApplicationCreateDto): boolean {
    // if we succeeded then the record is good to submit
    return true
  }
}
