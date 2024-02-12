import { OmitType } from "@nestjs/swagger"
import { Expose, Type } from "class-transformer"
import { IsEmail, IsOptional, IsString, Matches, MaxLength, ValidateNested } from "class-validator"
import { ValidationsGroupsEnum } from "../../shared/types/validations-groups-enum"
import { passwordRegex } from "../../shared/password-regex"
import { Match } from "../../shared/decorators/match.decorator"
import { EnforceLowerCase } from "../../shared/decorators/enforceLowerCase.decorator"
import { UserDto } from "./user.dto"
import { IdDto } from "../../shared/dto/id.dto"

export class UserCreateDto extends OmitType(UserDto, [
  "id",
  "createdAt",
  "updatedAt",
  "leasingAgentInListings",
  "roles",
  "jurisdictions",
  "email",
  "mfaEnabled",
  "passwordUpdatedAt",
  "passwordValidForDays",
  "lastLoginAt",
  "failedLoginAttemptsCount",
  "agreedToTermsOfService",
] as const) {
  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @Matches(passwordRegex, {
    message: "passwordTooWeak",
    groups: [ValidationsGroupsEnum.default],
  })
  password: string

  @Expose()
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(64, { groups: [ValidationsGroupsEnum.default] })
  @Match("password", { groups: [ValidationsGroupsEnum.default] })
  passwordConfirmation: string

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @Match("email", { groups: [ValidationsGroupsEnum.default] })
  @EnforceLowerCase()
  emailConfirmation?: string

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @IsString({ groups: [ValidationsGroupsEnum.default] })
  @MaxLength(256, { groups: [ValidationsGroupsEnum.default] })
  appUrl?: string | null

  @Expose()
  @IsOptional({ groups: [ValidationsGroupsEnum.default] })
  @ValidateNested({ groups: [ValidationsGroupsEnum.default], each: true })
  @Type(() => IdDto)
  jurisdictions?: IdDto[]

  @Expose()
  @IsEmail({}, { groups: [ValidationsGroupsEnum.default] })
  @EnforceLowerCase()
  email: string
}
