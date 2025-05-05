import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-custom'

import { AuthService } from '../auth.service'
import authConstants from '../constants'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super()
  }

  async validate(req: Request) {
    const { username } = req.body
    const user = await this.authService.validateUserLocal(req.id, username, authConstants.defaultPassword)

    if (!user)
      throw new UnauthorizedException()

    return user
  }
}
