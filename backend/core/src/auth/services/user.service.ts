import {
  BadRequestException,
  forwardRef,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { Brackets, DeepPartial, Repository } from "typeorm"
import { paginate, Pagination, PaginationTypeEnum } from "nestjs-typeorm-paginate"
import { decode, encode } from "jwt-simple"
import dayjs from "dayjs"
import crypto from "crypto"
import { User } from "../entities/user.entity"
import { ConfirmDto } from "../dto/confirm.dto"
import { USER_ERRORS } from "../user-errors"
import { UpdatePasswordDto } from "../dto/update-password.dto"
import { AuthService } from "./auth.service"
import { AuthzService } from "./authz.service"
import { ForgotPasswordDto } from "../dto/forgot-password.dto"
import { PasswordService } from "./password.service"
import { JurisdictionResolverService } from "../../jurisdictions/services/jurisdiction-resolver.service"
import { EmailDto } from "../dto/email.dto"
import { UserCreateDto } from "../dto/user-create.dto"
import { UserUpdateDto } from "../dto/user-update.dto"
import { UserListQueryParams } from "../dto/user-list-query-params"
import { UserInviteDto } from "../dto/user-invite.dto"
import { ConfigService } from "@nestjs/config"
import { authzActions } from "../enum/authz-actions.enum"
import { userFilterTypeToFieldMap } from "../dto/user-filter-type-to-field-map"
import { Application } from "../../applications/entities/application.entity"
import { Jurisdiction } from "../../jurisdictions/entities/jurisdiction.entity"
import { assignDefined } from "../../shared/utils/assign-defined"
import { EmailService } from "../../email/email.service"
import { RequestMfaCodeDto } from "../dto/request-mfa-code.dto"
import { RequestMfaCodeResponseDto } from "../dto/request-mfa-code-response.dto"
import { MfaType } from "../types/mfa-type"
import { SmsMfaService } from "./sms-mfa.service"
import { GetMfaInfoDto } from "../dto/get-mfa-info.dto"
import { GetMfaInfoResponseDto } from "../dto/get-mfa-info-response.dto"
import { addFilters } from "../../shared/query-filter"
import { UserFilterParams } from "../dto/user-filter-params"
import advancedFormat from "dayjs/plugin/advancedFormat"
import { REQUEST } from "@nestjs/core"
import { Request as ExpressRequest, Response } from "express"
import { UserProfileUpdateDto } from "../dto/user-profile.dto"
import { Listing } from "../../listings/entities/listing.entity"
import { ListingsService } from "../../listings/listings.service"
import { getPublicEmailURL } from "../../shared/utils/get-public-email-url"

dayjs.extend(advancedFormat)

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(Listing) private readonly listingRepository: Repository<Listing>,
    @InjectRepository(Application) private readonly applicationsRepository: Repository<Application>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
    private readonly passwordService: PasswordService,
    private readonly jurisdictionResolverService: JurisdictionResolverService,
    private readonly smsMfaService: SmsMfaService,
    @Inject(REQUEST) private req: ExpressRequest,
    @Inject(forwardRef(() => AuthzService)) private readonly authzService: AuthzService,
    @Inject(forwardRef(() => ListingsService)) private readonly listingsService: ListingsService
  ) {}

  public async findById(id: string) {
    const user = await this.findByIdHelper(id)

    if (!user) {
      throw new NotFoundException()
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    await this.authorizeUserAction(this.req.user as User, user, authzActions.read)

    return user
  }

  public async list(params: UserListQueryParams): Promise<Pagination<User>> {
    const options = {
      limit: params.limit === "all" ? undefined : params.limit,
      page: params.page || 10,
      PaginationType: PaginationTypeEnum.TAKE_AND_SKIP,
    }
    // https://www.npmjs.com/package/nestjs-typeorm-paginate
    const distinctIDQB = this.getQb()
    distinctIDQB.select("user.id")
    distinctIDQB.groupBy("user.id")
    distinctIDQB.orderBy("user.firstName")
    distinctIDQB.addOrderBy("user.lastName")
    const qb = this.getQb()

    if (params.filter) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const user = this.req.user as User
      addFilters<Array<UserFilterParams>, typeof userFilterTypeToFieldMap>(
        params.filter,
        userFilterTypeToFieldMap,
        distinctIDQB,
        user
      )
      addFilters<Array<UserFilterParams>, typeof userFilterTypeToFieldMap>(
        params.filter,
        userFilterTypeToFieldMap,
        qb,
        user
      )
    }

    if (params.search) {
      distinctIDQB.andWhere(
        new Brackets((subQb) => {
          subQb.where("user.firstName ILIKE :search", { search: `%${params.search}%` })
          subQb.orWhere("user.lastName ILIKE :search", { search: `%${params.search}%` })
          subQb.orWhere("user.email ILIKE :search", { search: `%${params.search}%` })
          subQb.orWhere("leasingAgentInListings.name ILIKE :search", {
            search: `%${params.search}%`,
          })
          subQb.orWhere(
            "CONCAT(user.firstName, ' ', user.lastName, ' ', user.email, ' ', leasingAgentInListings.name) ILIKE :search",
            { search: `%${params.search}%` }
          )
        })
      )
    }

    const distinctIDResult = await paginate<User>(distinctIDQB, options)

    qb.andWhere("user.id IN (:...distinctIDs)", {
      distinctIDs: distinctIDResult.items.map((elem) => elem.id),
    })

    qb.orderBy("user.firstName")
    qb.addOrderBy("user.lastName")

    const result = distinctIDResult.items.length ? await qb.getMany() : []
    /**
     * admin are the only ones that can access all users
     * so this will throw on the first user that isn't their own (non admin users can access themselves)
     */
    await Promise.all(
      result.map(async (user) => {
        await this.authorizeUserAction(this.req.user, user, authzActions.read)
      })
    )

    return {
      ...distinctIDResult,
      items: result,
    }
  }

  async update(dto: UserUpdateDto | UserProfileUpdateDto) {
    const user = await this.findById(dto.id)

    if (!user) {
      throw new NotFoundException()
    }

    if (dto instanceof UserProfileUpdateDto) {
      await this.authorizeUserProfileAction(this.req.user, user, authzActions.update)
    } else {
      await Promise.all(
        dto.jurisdictions.map(async (jurisdiction) => {
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
          await this.authzService.canOrThrow(this.req.user as User, "user", authzActions.update, {
            id: user.id,
            jurisdictionId: jurisdiction.id,
          })
        })
      )
    }

    let passwordHash
    let passwordUpdatedAt
    if (dto.password) {
      if (!dto.currentPassword) {
        // Validation is handled at DTO definition level
        throw new BadRequestException()
      }
      if (!(await this.passwordService.isPasswordValid(user, dto.currentPassword))) {
        throw new UnauthorizedException("invalidPassword")
      }

      passwordHash = await this.passwordService.passwordToHash(dto.password)
      passwordUpdatedAt = new Date()
      delete dto.password
    }

    if (dto.newEmail && dto.appUrl) {
      user.confirmationToken = UserService.createConfirmationToken(user.id, dto.newEmail)
      const confirmationUrl = UserService.getPublicConfirmationUrl(dto.appUrl, user)
      await this.emailService.changeEmail(user, dto.appUrl, confirmationUrl, dto.newEmail)
    }

    delete dto.newEmail
    delete dto.appUrl

    assignDefined(user, {
      ...dto,
      passwordHash,
      passwordUpdatedAt,
    })

    return await this.userRepository.save(user)
  }

  public async confirm(dto: ConfirmDto, res?: Response) {
    let token: Record<string, string> = {}
    try {
      token = decode(dto.token, process.env.APP_SECRET)
    } catch (e) {
      throw new HttpException(
        { message: USER_ERRORS.TOKEN_EXPIRED.message, knownError: true },
        USER_ERRORS.TOKEN_EXPIRED.status
      )
    }

    const user = await this.findByIdHelper(token.id)
    if (!user) {
      console.error(`Trying to confirm non-existing user ${token.id}.`)
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }

    if (user.confirmationToken !== dto.token) {
      console.error(
        `Confirmation token mismatch for user ${token.id}. Stored confirmation token: ${user.confirmationToken} incoming token: ${dto.token}`
      )
      throw new HttpException(USER_ERRORS.TOKEN_MISSING.message, USER_ERRORS.TOKEN_MISSING.status)
    }

    user.confirmedAt = new Date()
    user.confirmationToken = null

    if (dto.password) {
      user.passwordHash = await this.passwordService.passwordToHash(dto.password)
      user.passwordUpdatedAt = new Date()
    }

    try {
      await this.userRepository.save({
        ...user,
        ...(token.email && { email: token.email }),
      })
      if (res) {
        return await this.authService.tokenGen(res, user)
      } else {
        return { status: "ok" }
      }
    } catch (err) {
      throw new HttpException(USER_ERRORS.ERROR_SAVING.message, USER_ERRORS.ERROR_SAVING.status)
    }
  }

  public async resendPartnerConfirmation(dto: EmailDto) {
    const user = await this.findByEmail(dto.email)
    if (!user) {
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }
    if (user.confirmedAt) {
      // if the user is already confirmed, we do nothing
      // this is so on the front end people can't cheat to find out who has an email in the system
      return {}
    } else {
      user.confirmationToken = UserService.createConfirmationToken(user.id, user.email)
      try {
        await this.userRepository.save(user)
        const confirmationUrl = UserService.getPartnersConfirmationUrl(dto.appUrl, user)
        await this.emailService.invite(user, dto.appUrl, confirmationUrl)
        return user
      } catch (err) {
        throw new HttpException(USER_ERRORS.ERROR_SAVING.message, USER_ERRORS.ERROR_SAVING.status)
      }
    }
  }

  public async isUserConfirmationTokenValid(dto: ConfirmDto) {
    try {
      const token = decode(dto.token, process.env.APP_SECRET)
      const user = await this.findByIdHelper(token.id)
      await this.setHitConfirmationURl(user, dto.token)
      return true
    } catch (e) {
      try {
        const user = await this.findByConfirmationToken(dto.token)
        await this.setHitConfirmationURl(user, dto.token)
      } catch (e) {
        console.error("isUserConfirmationTokenValid error = ", e)
      }
      return false
    }
  }

  public async resendPublicConfirmation(dto: EmailDto) {
    const user = await this.findByEmail(dto.email)
    if (!user) {
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }
    if (user.confirmedAt) {
      throw new HttpException(
        USER_ERRORS.ACCOUNT_CONFIRMED.message,
        USER_ERRORS.ACCOUNT_CONFIRMED.status
      )
    } else {
      user.confirmationToken = UserService.createConfirmationToken(user.id, user.email)
      try {
        await this.userRepository.save(user)
        const confirmationUrl = UserService.getPublicConfirmationUrl(dto.appUrl, user)
        await this.emailService.welcome(user, dto.appUrl, confirmationUrl)
        return user
      } catch (err) {
        throw new HttpException(USER_ERRORS.ERROR_SAVING.message, USER_ERRORS.ERROR_SAVING.status)
      }
    }
  }

  public async connectUserWithExistingApplications(user: User) {
    const applications = await this.applicationsRepository
      .createQueryBuilder("applications")
      .leftJoinAndSelect("applications.applicant", "applicant")
      .where("applications.user IS NULL")
      .andWhere("applicant.emailAddress = :email", { email: user.email })
      .getMany()

    for (const application of applications) {
      application.user = user
    }

    await this.applicationsRepository.save(applications)
  }

  public async _createUser(dto: DeepPartial<User>, storedUser?: User) {
    if (dto.confirmedAt) {
      await this.authorizeUserAction(this.req.user, dto, authzActions.confirm)
    }

    const existingUser = storedUser ?? (await this.findByEmail(dto.email))

    if (existingUser) {
      if (!existingUser.roles && dto.roles) {
        // existing user && public user && user will get roles -> trying to grant partner access to a public user
        return await this.userRepository.save({
          ...existingUser,
          roles: dto.roles,
          leasingAgentInListings: dto.leasingAgentInListings,
          confirmationToken:
            existingUser.confirmationToken ||
            UserService.createConfirmationToken(existingUser.id, existingUser.email),
          confirmedAt: null,
        })
      } else if (
        existingUser?.roles?.isPartner &&
        dto?.roles?.isPartner &&
        this.jurisdictionsMismatch(dto, existingUser)
      ) {
        // recreating a partner with jurisdiction mismatch -> giving partner a new jurisdiction
        return await this.userRepository.save({
          ...existingUser,
          jurisdictions: [...existingUser.jurisdictions, ...dto.jurisdictions],
          leasingAgentInListings: [
            ...existingUser.leasingAgentInListings,
            ...dto.leasingAgentInListings,
          ],
          roles: dto.roles,
        })
      } else {
        // existing user && ((partner user -> trying to recreate user) || (public user -> trying to recreate a public user))
        throw new HttpException(
          { message: USER_ERRORS.EMAIL_IN_USE.message, knownError: true },
          USER_ERRORS.EMAIL_IN_USE.status
        )
      }
    }
    const newUser = await this.userRepository.save(dto)
    newUser.confirmationToken = UserService.createConfirmationToken(newUser.id, newUser.email)
    return await this.userRepository.save(newUser)
  }

  public async createPublicUser(dto: UserCreateDto, sendWelcomeEmail = false) {
    const newUser = await this._createUser({
      ...dto,
      passwordHash: await this.passwordService.passwordToHash(dto.password),
      jurisdictions: dto.jurisdictions
        ? (dto.jurisdictions as Jurisdiction[])
        : [await this.jurisdictionResolverService.getJurisdiction()],
      mfaEnabled: false,
    })
    if (sendWelcomeEmail) {
      const confirmationUrl = UserService.getPublicConfirmationUrl(dto.appUrl, newUser)
      await this.emailService.welcome(newUser, dto.appUrl, confirmationUrl)
    }
    await this.connectUserWithExistingApplications(newUser)
    return newUser
  }

  public async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.findByEmail(dto.email)
    if (user) {
      // Token expires in 1 hour
      const payload = { id: user.id, exp: Number.parseInt(dayjs().add(1, "hour").format("X")) }
      user.resetToken = encode(payload, process.env.APP_SECRET)
      await this.userRepository.save(user)
      await this.emailService.forgotPassword(user, dto.appUrl)
      return user
    }
  }

  public async updatePassword(dto: UpdatePasswordDto, res: Response) {
    const user = await this.findByResetToken(dto.token)
    if (!user) {
      throw new HttpException(USER_ERRORS.TOKEN_MISSING.message, USER_ERRORS.TOKEN_MISSING.status)
    }

    const token = decode(user.resetToken, process.env.APP_SECRET)
    if (token.id !== user.id) {
      throw new HttpException(USER_ERRORS.TOKEN_MISSING.message, USER_ERRORS.TOKEN_MISSING.status)
    }

    user.passwordHash = await this.passwordService.passwordToHash(dto.password)
    user.passwordUpdatedAt = new Date()
    user.resetToken = null
    await this.userRepository.save(user)
    return await this.authService.tokenGen(res, user)
  }

  async invite(dto: UserInviteDto) {
    const password = crypto.randomBytes(8).toString("hex")

    await this.validateInviteActionPermissionsOrThrow(dto)

    const existingUser = await this.findByEmail(dto.email)

    const user = await this._createUser(
      {
        ...dto,
        passwordHash: await this.passwordService.passwordToHash(password),
        jurisdictions: dto.jurisdictions
          ? dto.jurisdictions
          : [await this.jurisdictionResolverService.getJurisdiction()],
        mfaEnabled: true,
      },
      existingUser
    )

    if (
      existingUser &&
      existingUser?.roles?.isPartner &&
      dto?.roles?.isPartner &&
      this.jurisdictionsMismatch(dto, existingUser)
    ) {
      await this.emailService.portalAccountUpdate(
        user,
        this.configService.get("PARTNERS_PORTAL_URL"),
        existingUser
      )
    } else {
      await this.emailService.invite(
        user,
        this.configService.get("PARTNERS_PORTAL_URL"),
        UserService.getPartnersConfirmationUrl(this.configService.get("PARTNERS_PORTAL_URL"), user)
      )
    }
    return user
  }

  async delete(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) {
      throw new NotFoundException()
    }

    await this.authorizeUserAction(this.req.user, user, authzActions.delete)

    await this.userRepository.remove(user)
  }

  async getMfaInfo(getMfaInfoDto: GetMfaInfoDto): Promise<GetMfaInfoResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: getMfaInfoDto.email.toLowerCase() },
    })
    if (!user) {
      throw new UnauthorizedException()
    }

    const validPassword = await this.passwordService.isPasswordValid(user, getMfaInfoDto.password)
    if (!validPassword) {
      throw new UnauthorizedException()
    }

    return {
      email: user.email,
      phoneNumber: user.phoneNumber ?? undefined,
      isMfaEnabled: user.mfaEnabled,
      mfaUsedInThePast: UserService.hasUsedMfaInThePast(user),
    }
  }

  async requestMfaCode(requestMfaCodeDto: RequestMfaCodeDto): Promise<RequestMfaCodeResponseDto> {
    let user = await this.userRepository.findOne({
      where: { email: requestMfaCodeDto.email.toLowerCase() },
    })

    if (!user || !user.mfaEnabled) {
      throw new UnauthorizedException()
    }

    const validPassword = await this.passwordService.isPasswordValid(
      user,
      requestMfaCodeDto.password
    )
    if (!validPassword) {
      throw new UnauthorizedException()
    }

    if (requestMfaCodeDto.mfaType === MfaType.sms) {
      if (requestMfaCodeDto.phoneNumber) {
        if (user.phoneNumberVerified) {
          throw new UnauthorizedException(
            "phone number can only be specified the first time using mfa"
          )
        }
        user.phoneNumber = requestMfaCodeDto.phoneNumber
      } else if (!requestMfaCodeDto.phoneNumber && !user.phoneNumber) {
        throw new HttpException(
          { name: "phoneNumberMissing", message: "no valid phone number was found" },
          400
        )
      }
    }
    const mfaCode = this.generateMfaCode()
    user.mfaCode = mfaCode
    user.mfaCodeUpdatedAt = new Date()

    user = await this.userRepository.manager.transaction(async (entityManager) => {
      const transactionalRepository = entityManager.getRepository(User)
      await transactionalRepository.save(user)
      if (requestMfaCodeDto.mfaType === MfaType.email) {
        await this.emailService.sendMfaCode(user, user.email, mfaCode)
      } else if (requestMfaCodeDto.mfaType === MfaType.sms) {
        await this.smsMfaService.sendMfaCode(user, user.phoneNumber, mfaCode)
      }
      return user
    })

    return requestMfaCodeDto.mfaType === MfaType.email
      ? { email: user.email, phoneNumberVerified: user.phoneNumberVerified }
      : {
          phoneNumber: user.phoneNumber,
          phoneNumberVerified: user.phoneNumberVerified,
        }
  }

  public static isPasswordOutdated(user: User) {
    return (
      new Date(user.passwordUpdatedAt.getTime() + user.passwordValidForDays * 24 * 60 * 60 * 1000) <
        new Date() &&
      user.roles &&
      (user.roles.isAdmin || user.roles.isPartner || user.roles.isJurisdictionalAdmin)
    )
  }

  public getQb() {
    return this.userRepository
      .createQueryBuilder("user")
      .leftJoin("user.leasingAgentInListings", "leasingAgentInListings")
      .leftJoin("user.jurisdictions", "jurisdictions")
      .leftJoin("user.roles", "userRoles")
      .select([
        "user",
        "jurisdictions.id",
        "userRoles",
        "leasingAgentInListings.id",
        "leasingAgentInListings.name",
      ])
  }

  public findByEmail(email: string) {
    return this.getQb().where("user.email = :email", { email: email.toLowerCase() }).getOne()
  }

  public findByIdHelper(id: string) {
    return this.getQb().where("user.id = :id", { id }).getOne()
  }

  public findByConfirmationToken(token: string) {
    return this.getQb().where("user.confirmationToken = :token", { token }).getOne()
  }

  public findByResetToken(token: string) {
    return this.getQb().where("user.resetToken = :token", { token }).getOne()
  }

  private generateMfaCode() {
    let out = ""
    const characters = "0123456789"
    for (let i = 0; i < this.configService.get<number>("MFA_CODE_LENGTH"); i++) {
      out += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return out
  }

  private static hasUsedMfaInThePast(user: User): boolean {
    return !!user.mfaCodeUpdatedAt
  }

  private static createConfirmationToken(userId: string, email: string) {
    const payload = {
      id: userId,
      email,
      exp: Number.parseInt(dayjs().add(24, "hours").format("X")),
    }
    return encode(payload, process.env.APP_SECRET)
  }

  private static getPublicConfirmationUrl(appUrl: string, user: User) {
    return getPublicEmailURL(appUrl, user.confirmationToken)
  }

  private static getPartnersConfirmationUrl(appUrl: string, user: User) {
    return `${appUrl}/users/confirm?token=${user.confirmationToken}`
  }

  private async setHitConfirmationURl(user: User, token: string) {
    if (!user) {
      throw new HttpException(USER_ERRORS.NOT_FOUND.message, USER_ERRORS.NOT_FOUND.status)
    }

    if (user.confirmationToken !== token) {
      throw new HttpException(USER_ERRORS.TOKEN_MISSING.message, USER_ERRORS.TOKEN_MISSING.status)
    }
    user.hitConfirmationURL = new Date()

    await this.userRepository.save({
      ...user,
    })
  }

  private async authorizeUserAction(requestingUser, targetUser, action) {
    if (requestingUser?.roles?.isJurisdictionalAdmin) {
      return this.authorizeJurisdictionalAdmin(requestingUser, targetUser)
    }
    return await this.authzService.canOrThrow(requestingUser, "user", action, {
      id: targetUser.id,
    })
  }

  private authorizeJurisdictionalAdmin(requestingUser, targetUser) {
    // jurisdictional admins can't view super admins
    if (targetUser?.roles?.isAdmin) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN)
    }

    const requesterJurisdictions = requestingUser.jurisdictions?.map((juris) => juris.id)
    const targetJurisdictions = targetUser.jurisdictions?.map((juris) => juris.id)
    // jurisdictional admins should only see a user if they share a jurisdiction
    const res = requesterJurisdictions.some((juris) => targetJurisdictions.includes(juris))

    if (!res) {
      throw new HttpException("Forbidden", HttpStatus.FORBIDDEN)
    }
    return res
  }

  private async authorizeUserProfileAction(requestingUser, targetUser, action) {
    return await this.authzService.canOrThrow(requestingUser, "userProfile", action, {
      id: targetUser.id,
      jurisdictionId: targetUser.id,
    })
  }

  private async validateInviteActionPermissionsOrThrow(dto: UserInviteDto) {
    if (dto.roles.isAdmin) {
      await this.authzService.canOrThrow(
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        this.req.user as User,
        "user",
        authzActions.inviteSuperAdmin,
        null
      )
    }

    // For each jurisdiction we need to check if this requesting user is allowed to invite new users to it
    if (dto.roles.isJurisdictionalAdmin) {
      if (dto.jurisdictions?.length) {
        await Promise.all(
          dto.jurisdictions.map(async (jurisdiction) => {
            await this.authzService.canOrThrow(
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              this.req.user as User,
              "user",
              authzActions.inviteJurisdictionalAdmin,
              {
                jurisdictionId: jurisdiction.id,
              }
            )
          })
        )
      }
    }

    if (dto.leasingAgentInListings?.length) {
      // For each jurisdiction we need to check if this requesting user is allowed to invite new users to it
      const jurisdictionsIds = await Promise.all(
        dto.leasingAgentInListings.map(async (listing) => {
          return await this.listingsService.getJurisdictionIdByListingId(listing.id)
        })
      )

      await Promise.all(
        jurisdictionsIds.map(async (jurisdictionId) => {
          await this.authzService.canOrThrow(
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            this.req.user as User,
            "user",
            authzActions.invitePartner,
            {
              jurisdictionId,
            }
          )
        })
      )
    }
  }

  private jurisdictionsMismatch(incomingUser: DeepPartial<User>, existingUser: User | undefined) {
    // verify that there is a jurisdictional difference between the incoming user and the existing user
    return incomingUser?.jurisdictions?.some(
      (incomingJuris) =>
        !existingUser?.jurisdictions?.some((existingJuris) => existingJuris.id === incomingJuris.id)
    )
  }
}
