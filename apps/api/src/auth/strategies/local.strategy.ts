import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'

import { TenantsService } from '~/tenants/tenants.service'

import { AuthService } from '../auth.service'
import authConstants from '../constants'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authService: AuthService,
    private readonly tenantsService: TenantsService,
  ) {
    super()
  }

  async validate(req: Application.Request) {
    const { username } = req.body
    const user = await this.authService.validateUserLocal(this.tenantsService.getTenantIdFromRequest(req), username, authConstants.defaultPassword)

    if (!user)
      throw new UnauthorizedException()

    return user
  }
}
