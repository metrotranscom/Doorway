import { Strategy } from "passport-custom"
import { PassportStrategy } from "@nestjs/passport"
import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
  ValidationPipe,
} from "@nestjs/common"
import { User } from "../entities/user.entity"
import { InjectRepository } from "@nestjs/typeorm"
import { Repository } from "typeorm"
import { PasswordService } from "../services/password.service"
import { defaultValidationPipeOptions } from "../../shared/default-validation-pipe-options"
import { LoginDto } from "../dto/login.dto"
import { ConfigService } from "@nestjs/config"
import { UserService } from "../services/user.service"
import { USER_ERRORS } from "../user-errors"
import { MfaType } from "../types/mfa-type"

@Injectable()
export class LocalMfaStrategy extends PassportStrategy(Strategy, "localMfa") {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService
  ) {
    super()
  }

  async validate(req: Request): Promise<User> {
    const validationPipe = new ValidationPipe(defaultValidationPipeOptions)
    const loginDto: LoginDto = await validationPipe.transform(req.body, {
      type: "body",
      metatype: LoginDto,
    })

    const user = await this.userRepository.findOne({
      where: { email: loginDto.email.toLowerCase() },
      relations: ["leasingAgentInListings"],
    })

    if (user) {
      // Public users should not be able to log into the partner site.
      // Validate the origin url vs the env variable to see if it is the partner url
      const originUrl = req.headers["appurl"]
      if (
        originUrl &&
        originUrl === this.configService.get<string>("PARTNERS_PORTAL_URL") &&
        !user.roles
      ) {
        Logger.log("public user attempting to log into partner site")
        throw new UnauthorizedException()
      }
      if (user.lastLoginAt) {
        const retryAfter = new Date(
          user.lastLoginAt.getTime() + this.configService.get<number>("AUTH_LOCK_LOGIN_COOLDOWN_MS")
        )
        if (
          user.failedLoginAttemptsCount >=
          this.configService.get<number>("AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS")
        ) {
          user.failedLoginAttemptsCount = 0
          if (retryAfter > new Date()) {
            throw new HttpException(
              {
                statusCode: HttpStatus.TOO_MANY_REQUESTS,
                error: "Too Many Requests",
                message: "Failed login attempts exceeded.",
                retryAfter,
              },
              429
            )
          }
        }
      }

      if (!user.confirmedAt) {
        throw new HttpException(
          {
            message: USER_ERRORS.ACCOUNT_NOT_CONFIRMED.message,
            knownError: true,
          },
          USER_ERRORS.ACCOUNT_NOT_CONFIRMED.status
        )
      }

      if (UserService.isPasswordOutdated(user)) {
        throw new HttpException(
          {
            message: USER_ERRORS.PASSWORD_OUTDATED.message,
            knownError: true,
          },
          USER_ERRORS.PASSWORD_OUTDATED.status
        )
      }

      const validPassword = await this.passwordService.isPasswordValid(user, loginDto.password)

      let mfaAuthSuccessful = true
      if (validPassword && user.mfaEnabled) {
        if (!loginDto.mfaCode || !user.mfaCode || !user.mfaCodeUpdatedAt) {
          user.failedLoginAttemptsCount = 0
          await this.userRepository.save(user)
          throw new UnauthorizedException({ name: "mfaCodeIsMissing", knownError: true })
        } else if (
          new Date(
            user.mfaCodeUpdatedAt.getTime() + this.configService.get<number>("MFA_CODE_VALID_MS")
          ) < new Date() ||
          user.mfaCode !== loginDto.mfaCode
        ) {
          mfaAuthSuccessful = false
        } else {
          user.mfaCode = null
          user.mfaCodeUpdatedAt = new Date()
        }
      }

      if (validPassword && mfaAuthSuccessful) {
        user.failedLoginAttemptsCount = 0
        if (!user.phoneNumberVerified && loginDto.mfaType === MfaType.sms) {
          user.phoneNumberVerified = true
        }
      } else {
        user.failedLoginAttemptsCount += 1
      }

      user.lastLoginAt = new Date()
      await this.userRepository.save(user)

      if (!validPassword) {
        throw new UnauthorizedException({
          failureCountRemaining:
            this.configService.get<number>("AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS") +
            1 -
            user.failedLoginAttemptsCount,
          knownError: true,
        })
      } else if (mfaAuthSuccessful) {
        return user
      } else if (user.mfaEnabled) {
        throw new UnauthorizedException({
          message: "mfaUnauthorized",
          failureCountRemaining:
            this.configService.get<number>("AUTH_LOCK_LOGIN_AFTER_FAILED_ATTEMPTS") +
            1 -
            user.failedLoginAttemptsCount,
          knownError: true,
        })
      }
    }

    throw new UnauthorizedException()
  }
}
