import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-custom'

import { AuthService } from '../auth.service'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super()
  }

  async validate(req: Request) {
    const { refresh_token: refreshToken } = req.body
    const user = await this.authService.validateUserByRefreshToken(req.id, refreshToken)

    if (!user)
      throw new UnauthorizedException()

    return user
  }
}
