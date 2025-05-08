import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'

import { TenantsService } from '~/tenants/tenants.service'

import { AuthService } from '../auth.service'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantsService: TenantsService,
  ) {
    super()
  }

  async validate(req: Application.Request) {
    const { refresh_token: refreshToken } = req.body
    const user = await this.authService.validateUserByRefreshToken(this.tenantsService.getTenantIdFromRequest(req), refreshToken)

    if (!user)
      throw new UnauthorizedException()

    return user
  }
}
