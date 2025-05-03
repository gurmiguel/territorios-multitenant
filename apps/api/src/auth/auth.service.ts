import { promisify } from 'node:util'

import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'

import { User } from '~/generated/prisma'
import { UsersService } from '~/users/users.service'

import authConstants from './constants'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.usersService.find({ email: username })

    if (!user || await this.checkPassword(password, authConstants.defaultPassword))
      return null

    const {
      /* use spread operator to remove any sensitive info here */
      ...result
    } = user

    return result
  }

  async signin(user: User) {
    return {
      access_token: await this.jwtService.signAsync({ sub: user.id, username: user.email }),
      refresh_token: await this.jwtService.signAsync({ sub: user.id }),
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
