import { promisify } from 'node:util'

import { BadRequestException, ForbiddenException, HttpException, Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Action, Area, Permissions, Role } from '@repo/utils/permissions/index'
import bcrypt from 'bcrypt'
import z from 'zod'

import { Configuration } from '~/config/configuration'
import { CongregationsService } from '~/congregations/congregations.service'
import { Congregation, SuperAdmin, User as PrismaUser } from '~/generated/prisma/client'
import { SuperadminService } from '~/superadmin/superadmin.service'
import { TenantsService } from '~/tenants/tenants.service'
import { UsersService } from '~/users/users.service'

import { AuthProviders } from './auth-providers.enum'
import { SafeAuthGuard } from './guards/safe-auth.guard'

@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name)
  public static readonly CRAWLER_FAKE_USERID = 'FAKE_CRAWLER'

  constructor(
    protected readonly congregationsService: CongregationsService,
    protected readonly usersService: UsersService,
    protected readonly superadminService: SuperadminService,
    protected readonly tenantsService: TenantsService,
    protected readonly jwtService: JwtService,
    private readonly config: ConfigService<Configuration, true>,
  ) {}

  async validateUserLocal(tenantHost: string, username: string, password: string): Promise<User | null> {
    const { success: isValid } = z.object({ username: z.email().nonempty(), password: z.string() }).safeParse({ username, password })

    if (!isValid) return null

    const user = await this.usersService.find({
      where: {
        congregation: { domains: {has: tenantHost} },
        email: username,
      },
      include: { congregation: true },
    })

    if (!user || await this.checkPassword(password, this.config.get('auth', { infer: true }).defaultPassword))
      return null

    if (user.deletedAt !== null) {
      await this.usersService.update({ where: { id: user.id }, data: { deletedAt: null } })
      user.deletedAt = null
    }

    return this.buildUser(user, AuthProviders.TFA)
  }

  async validateUserByProvider(tenantHost: string, provider: AuthProviders, uid: string, profile: Pick<User, 'email' | 'name'>): Promise<User | null> {
    const tenant = await this.congregationsService.find({ where: { domains: { has: tenantHost } } })

    if (!tenant) throw new Error(`Invalid Tenant: ${tenantHost}`)

    let user = await this.usersService.find({
      where: {
        congregation: { id: tenant.id },
        deletedAt: null,
        email: profile.email,
      },
      include: {
        congregation: true,
        providers: {
          where: { provider },
        },
      },
    })

    const providerData = {
      provider,
      sub: uid,
      payload: profile,
      isSafe: true,
    }

    const providerUsersCount = await this.usersService.countUsers({
      where: {
        congregation: { id: tenant.id },
        providers: { some: { id: { not: '' } } },
      },
    })
    const isFirstProviderUser = providerUsersCount === 0

    this.logger.log(`Logging user with provider ${provider}. [isFirstProviderUser=${isFirstProviderUser}]`)

    if (!user) {
      user = await this.usersService.create({
        data: {
          name: profile.name,
          email: profile.email,
          congregation: { connect: { id: tenant.id } },
          permissions: Permissions.getDefaultUserPermissions(),
          providers: {
            create: providerData,
          },
        },
        include: {
          congregation: true,
          providers: {
            where: { provider },
          },
        },
      })
    }

    if (isFirstProviderUser) {
      user = {
        ...user,
        ...await this.usersService.update({
          where: { id: user.id },
          data: {
            roles: [Role.ADMIN, Role.USER],
            permissions: Permissions.getTenantAdminPermissions(),
          },
        }),
      }
    }

    if (!user.providers.some(p => p.provider === provider)) {
      await this.usersService.addProvider({
        ...providerData,
        userId: user.id,
      })
    }

    if (user.deletedAt !== null) {
      await this.usersService.update({ where: { id: user.id }, data: { deletedAt: null } })
      user.deletedAt = null
    }

    return this.buildUser(user, provider)
  }

  async validateUserByRefreshToken(refreshToken: string) {
    return this.validateByToken('refresh_token', refreshToken, false)
  }

  async validateUserByAccessToken(accessToken: string) {
    return this.validateByToken('access_token', accessToken)
  }

  private async validateByToken<T extends AccessTokenPayload | RefreshTokenPayload>(tokenType: T['type'], token: string, allowSoftDeleted = true) {
    try {
      const tokenPayload = await this.jwtService.verifyAsync<T>(token)
        .catch(error => {
          throw new ForbiddenException('Invalid token', { cause: error, description: (error as Error).message })
        })

      if (tokenPayload.type !== tokenType)
        throw new ForbiddenException(`Token is not a valid ${tokenType}`)

      if (tokenPayload.sub === AuthService.CRAWLER_FAKE_USERID) {
        return this.buildUser(await this.getFakeCrawlerUser(tokenPayload.iss.split(';')), tokenPayload.provider)
      }

      const user = await this.usersService.find({
        where: {
          id: tokenPayload.sub,
          congregation: {
            domains: { hasSome: String(tokenPayload.iss).split(';') },
          },
          deletedAt: allowSoftDeleted ? undefined : null,
        },
        include: { congregation: true },
      })

      if (!user)
        throw new UnauthorizedException()

      if (user.deletedAt !== null) {
        await this.usersService.update({ where: { id: user.id }, data: { deletedAt: null } })
        user.deletedAt = null
      }

      return this.buildUser(user, tokenPayload.provider ?? AuthProviders.Email)
    } catch (e) {
      this.logger.debug(e instanceof Error ? `${e.name}: ${e.message}` : e)
      throw e instanceof HttpException ? e : new UnauthorizedException()
    }
  }

  async superadminSignin(superadmin: Pick<SuperAdmin, 'id' | 'email'>) {
    const provider = AuthProviders.TFA

    const payload: SuperAdminTokenPayload = {
      sub: superadmin.id,
      iss: 'superadmin',
      type: 'access_token',
      username: superadmin.email,
      provider,
      isSafeProvider: SafeAuthGuard.isSafeProvider(provider),
    }
    return {
      access_token: await this.jwtService.signAsync(payload, { expiresIn: '1 hour' }),
    }
  }

  async validateSuperToken(superToken: string) {
    try {
      const token = await this.jwtService.verifyAsync<SuperAdminTokenPayload>(superToken)
        .catch(error => {
          throw new ForbiddenException('Invalid token', { cause: error, description: (error as Error).message })
        })

      if (token.type !== 'access_token')
        throw new ForbiddenException('Token is not a valid access_token')

      if (token.iss !== 'superadmin')
        throw new ForbiddenException('Token is not valid')

      const superadmin = await this.superadminService.find({
        where: { id: token.sub },
      })

      if (!superadmin)
        throw new UnauthorizedException()

      return {
        ...superadmin,
        provider: token.provider,
        isSafeProvider: token.isSafeProvider,
      }
    } catch (e) {
      this.logger.debug(e instanceof Error ? `${e.name}: ${e.message}` : e)
      throw e instanceof HttpException ? e : new UnauthorizedException()
    }
  }

  async signin(user: Pick<User, 'id' | 'congregation' | 'email' | 'permissions'>, provider: AuthProviders) {
    const basePayload: TokenPayload = {
      sub: user.id,
      iss: user.congregation.domains.join(';'),
      provider,
      isSafeProvider: SafeAuthGuard.isSafeProvider(provider),
    }
    const payload = {
      username: user.email,
      permissions: user.permissions,
    }
    return {
      access_token: await this.jwtService.signAsync({ ...basePayload, ...payload, type: 'access_token' } satisfies AccessTokenPayload, { expiresIn: '1 hour' }),
      refresh_token: await this.jwtService.signAsync({ ...basePayload, type: 'refresh_token' } satisfies RefreshTokenPayload, { expiresIn: '60 days' }),
    }
  }

  async signup({ email, name }: Pick<User, 'email' | 'name'>, provider: AuthProviders, tenant: Congregation) {
    const { success: isValid } = z.object({ email: z.email().nonempty(), name: z.string() }).safeParse({ email, name })

    if (!isValid) throw new BadRequestException('Invalid email or name')

    const user = await this.usersService.upsert({
      where: { email_congregationId: { email, congregationId: tenant.id } },
      create: {
        email,
        name,
        congregationId: tenant.id,
        permissions: Permissions.getDefaultUserPermissions(),
      },
      update: { deletedAt: null },
      include: { congregation: true },
    })

    return this.signin(this.buildUser(user, provider), provider)
  }

  async updateAdminsPermissions() {
    const allPermissions = Permissions.getTenantAdminPermissions()
    const { count } = await this.usersService.updateMany({
      where: {
        roles: { has: Role.ADMIN },
        NOT: {
          permissions: { hasEvery: allPermissions },
        },
      },
      data: {
        permissions: allPermissions,
      },
    })

    this.logger.log(`Updated ${count} admin users with current roles`)
  }

  async getFakeCrawlerUser(tenantHosts: string[]): Promise<Omit<User, 'refresh'>>
  async getFakeCrawlerUser(req: Application.Request): Promise<Omit<User, 'refresh'>>
  async getFakeCrawlerUser(reqOrTenantHost: Application.Request | string[]) {
    const tenantHosts = Array.isArray(reqOrTenantHost)
      ? reqOrTenantHost
      : [this.tenantsService.getTenantHostFromRequest(reqOrTenantHost)].filter((x): x is string => !!x)

    if (!tenantHosts.length)
      throw new BadRequestException('Tenant host is required')

    const congregation = await this.congregationsService.find({
      where: { domains: { hasSome: tenantHosts } },
    })

    if (!congregation)
      throw new ForbiddenException('Invalid tenant host')

    const fakeUser = {
      id: AuthService.CRAWLER_FAKE_USERID,
      email: 'crawler@territorios.app',
      congregation,
      congregationId: congregation.id,
      permissions: Permissions.getFor({
        area: { exclude: [Area.USERS] },
        action: { include: [Action.READ] },
      }),
      createdAt: new Date(),
      name: 'Fake Crawler User',
      roles: [Role.USER],
      provider: AuthProviders.Email,
      isSafeProvider: false,
      deletedAt: null,
    } satisfies Omit<User, 'refresh'>

    return fakeUser
  }

  private async checkPassword(password: string, encrypted: string) {
    const compare = promisify(bcrypt.compare)

    return compare(password, encrypted)
  }

  private buildUser(user: PrismaUser & { congregation: Congregation }, provider: AuthProviders) {
    const {
      /* use spread operator to remove any sensitive info here */
      ...userData
    } = user

    const { usersService } = this

    return {
      ...userData,
      provider,
      isSafeProvider: SafeAuthGuard.isSafeProvider(provider),
      async refresh() {
        Object.assign(this, await usersService.find({ where: { id: userData.id, deletedAt: null }, include: { congregation: true } }))
        return this
      },
    }
  }
}

type User = Express.User

interface TokenPayload {
  sub: User['id']
  iss: string
  provider: AuthProviders
  isSafeProvider: boolean
}

interface SuperAdminTokenPayload extends TokenPayload {
  type: 'access_token'
  username: SuperAdmin['email']
}

interface AccessTokenPayload extends TokenPayload {
  type: 'access_token'
  username: User['email']
}
interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh_token'
}
