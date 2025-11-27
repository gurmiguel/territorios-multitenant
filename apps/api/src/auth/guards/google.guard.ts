import { ExecutionContext, ForbiddenException, HttpStatus, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

import { MissingTenantException } from '~/exceptions/tenant-exceptions'
import { TenantsService } from '~/tenants/tenants.service'

import { AuthService } from '../auth.service'
import { GoogleStrategy } from '../strategies/google.strategy'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(
    private readonly strategy: GoogleStrategy,
    private readonly tenantsService: TenantsService,
    private readonly authService: AuthService,
  ) {
    super({
      accessType: 'offline',
      prompt: 'select_account',
    })
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Application.Request>()
    const response = context.switchToHttp().getResponse<Application.Response>()
    const { redirectUrl } = request.query

    const tenantHost = this.tenantsService.getTenantIdFromRequest(request)

    const sessionKey = (this.strategy as any)._key

    request.session[sessionKey] ??= {}
    const session = request.session[sessionKey]

    if (!['state', 'code', 'scope'].every(k => k in request.query)) {
      if (!redirectUrl)
        throw new ForbiddenException('redirectUrl parameter was not provided')
      if (!tenantHost)
        throw new MissingTenantException()

      session.redirectUrl = redirectUrl
      session.tenant = tenantHost
    }

    const activate = (await super.canActivate(context)) as boolean

    if (activate) {
      const { refresh_token } = await this.authService.signin(request.user!)

      const redirectUrl = new URL(session.redirectUrl)
      redirectUrl.searchParams.set('auth_result', 'success')
      redirectUrl.searchParams.set('auth_provider', 'google')
      redirectUrl.searchParams.set('code', refresh_token)

      await new Promise(resolve => request.session.destroy(resolve))

      response.redirect(HttpStatus.FOUND, redirectUrl.href)
      return false
    }

    return activate
  }
}
