import { promisify } from 'node:util'

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'

import { Congregation, User as PrismaUser } from '~/generated/prisma'
import { TenantHolderService } from '~/tenants/tenant-holder.service'
import { UsersService } from '~/users/users.service'

import authConstants from './constants'

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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tenantHolder: TenantHolderService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUserLocal(requestId: string, username: string, password: string): Promise<User | null> {
    const tenantId = this.tenantHolder.getTenant(requestId).id

    const user = await this.usersService.find({
      where: {
        email: username, congregationId: tenantId,
      },
      include: { congregation: true },
    })

    if (!user || await this.checkPassword(password, authConstants.defaultPassword))
      return null

    return this.buildUser(user)
  }

  async validateUserByProvider(requestId: string, provider: string, uid: string, profile: Pick<User, 'email' | 'name'>): Promise<User | null> {
    const tenantId = this.tenantHolder.getTenant(requestId).id

    let user = await this.usersService.find({
      where: {
        congregationId: tenantId,
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
      user = await this.usersService.create({
        data: {
          name: profile.name,
          email: profile.email,
          congregationId: tenantId,
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

  async validateUserByRefreshToken(requestId: string, refreshToken: any) {
    const tenant = this.tenantHolder.getTenant(requestId)

    try {
      const tokenPayload = await this.jwtService.verifyAsync<RefreshTokenPayload>(refreshToken)

      if (tenant.slug !== tokenPayload.iss)
        throw new UnauthorizedException('Tenant id invalid for this user')

      const user = await this.usersService.find({
        where: { id: tokenPayload.sub, congregationId: tenant.id },
        include: { congregation: true },
      })

      if (!user)
        throw new UnauthorizedException()

      return this.buildUser(user)
    } catch (e) {
      Logger.error(e)
      throw e instanceof UnauthorizedException ? e : new UnauthorizedException()
    }
  }

  async signin(user: User) {
    const payload: TokenPayload = {
      sub: user.id,
      iss: user.congregation.slug,
    }
    return {
      access_token: await this.jwtService.signAsync({ ...payload, type: 'access_token', username: user.email } satisfies AccessTokenPayload, { expiresIn: '1h' }),
      refresh_token: await this.jwtService.signAsync({ ...payload, type: 'refresh_token' } satisfies RefreshTokenPayload, { expiresIn: '60 days' }),
    }
  }

  private async hashPassword(password: string) {
    const hash = promisify(bcrypt.hash)

    return hash(password, 10)
  }

  private async checkPassword(password: string, encrypted: string) {
    const compare = promisify(bcrypt.compare)

    return compare(password, encrypted)
  }

  private buildUser(user: PrismaUser & { congregation: Congregation }): User {
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
