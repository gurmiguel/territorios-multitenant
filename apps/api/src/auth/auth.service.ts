import { promisify } from 'node:util'

import { Injectable } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import bcrypt from 'bcrypt'
import { User } from 'express'

import { TenantHolderService } from '~/tenants/tenant-holder.service'
import { UsersService } from '~/users/users.service'

import authConstants from './constants'

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

    const {
      /* use spread operator to remove any sensitive info here */
      ...result
    } = user

    return result
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

    return user
  }

  async signin(user: User) {
    const opts: JwtSignOptions = {
      subject: user.id,
      issuer: user.congregation.slug,
    }
    return {
      access_token: await this.jwtService.signAsync({ type: 'access_token', username: user.email }, opts),
      refresh_token: await this.jwtService.signAsync({ type: 'refresh_token' }, { ...opts, expiresIn: '60 days' }),
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
}
