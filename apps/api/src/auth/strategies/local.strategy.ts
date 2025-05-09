import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'

import { MissingTenantException } from '~/exceptions/tenant-exceptions'
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
    const tenantId = this.tenantsService.getTenantIdFromRequest(req)

    if (!tenantId)
      throw new MissingTenantException()

    const user = await this.authService.validateUserLocal(tenantId, username, authConstants.defaultPassword)

    if (!user)
      throw new UnauthorizedException()

    return user
  }
}
