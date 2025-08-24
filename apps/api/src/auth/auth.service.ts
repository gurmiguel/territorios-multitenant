import { promisify } from 'node:util'

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { Action, Area, Permissions, Role } from '@repo/utils/permissions/index'
import bcrypt from 'bcrypt'

import { Configuration } from '~/config/configuration'
import { Congregation, User as PrismaUser } from '~/generated/prisma'
import { UsersService } from '~/users/users.service'

@Injectable()
export class AuthService {
  protected readonly logger = new Logger(AuthService.name)

  constructor(
    protected readonly usersService: UsersService,
    protected readonly jwtService: JwtService,
    private readonly config: ConfigService<Configuration, true>,
  ) {}

  async validateUserLocal(tenantId: string, username: string, password: string): Promise<User | null> {
    const user = await this.usersService.find({
      where: {
        email: username, congregation: { slug: tenantId },
      },
      include: { congregation: true },
    })

    if (!user || await this.checkPassword(password, this.config.get('auth', { infer: true }).defaultPassword))
      return null

    return this.buildUser(user)
  }

  async validateUserByProvider(tenantId: string, provider: string, uid: string, profile: Pick<User, 'email' | 'name'>): Promise<User | null> {
    let user = await this.usersService.find({
      where: {
        congregation: { slug: tenantId },
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

    if (!user) {
      const usersCount = await this.usersService.countUsers({ where: { congregation: { slug: tenantId } } })
      const isFirstUser = usersCount === 0

      user = await this.usersService.create({
        data: {
          name: profile.name,
          email: profile.email,
          congregation: { connect: { slug: tenantId } },
          permissions: isFirstUser
            ? Permissions.getAllPermissions()
            : Permissions.getFor({
              area: { exclude: [Area.USERS] },
              action: { include: [Action.READ] },
            }),
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

    if (!user.providers.some(p => p.provider === provider)) {
      await this.usersService.addProvider({
        ...providerData,
        userId: user.id,
      })
    }

    return this.buildUser(user)
  }

  async validateUserByRefreshToken(refreshToken: string) {
    return this.validateByToken('refresh_token', refreshToken)
  }

  async validateUserByAccessToken(accessToken: string) {
    return this.validateByToken('access_token', accessToken)
  }

  private async validateByToken<T extends AccessTokenPayload | RefreshTokenPayload>(tokenType: T['type'], token: string) {
    try {
      const tokenPayload = await this.jwtService.verifyAsync<T>(token)

      if (tokenPayload.type !== tokenType)
        throw new UnauthorizedException(`Token is not a valid ${tokenType}`)

      const user = await this.usersService.find({
        where: { id: tokenPayload.sub, congregation: { slug: tokenPayload.iss } },
        include: { congregation: true },
      })

      if (!user)
        throw new UnauthorizedException()

      return this.buildUser(user)
    } catch (e) {
      this.logger.debug(e instanceof Error ? `${e.name}: ${e.message}` : e)
      throw e instanceof UnauthorizedException ? e : new UnauthorizedException()
    }
  }

  async signin(user: User) {
    const basePayload: TokenPayload = {
      sub: user.id,
      iss: user.congregation.slug,
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

  async updateAdminsPermissions() {
    const allPermissions = Permissions.getAllPermissions()
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

  private async hashPassword(password: string) {
    const hash = promisify(bcrypt.hash)

    return hash(password, 10)
  }

  private async checkPassword(password: string, encrypted: string) {
    const compare = promisify(bcrypt.compare)

    return compare(password, encrypted)
  }

  private buildUser(user: PrismaUser & { congregation: Congregation }) {
    const {
      /* use spread operator to remove any sensitive info here */
      ...userData
    } = user

    const { usersService } = this

    return {
      ...userData,
      async refresh() {
        Object.assign(this, await usersService.find({ where: { id: userData.id }, include: { congregation: true } }))
        return this
      },
    }
  }
}

type User = Express.User

interface TokenPayload {
  sub: User['id']
  iss: User['congregation']['slug']
}

interface AccessTokenPayload extends TokenPayload {
  type: 'access_token'
  username: User['email']
}
interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh_token'
}
