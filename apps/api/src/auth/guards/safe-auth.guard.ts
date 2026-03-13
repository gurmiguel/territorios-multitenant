import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { AuthProviders, SafeAuthProviders } from '../auth-providers.enum'
import { SAFE_AUTH_ROUTE } from '../decorators/safe-auth.decorator'

@Injectable()
export class SafeAuthGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const isSafeGuardedRoute = this.reflector.getAllAndOverride<boolean | void>(SAFE_AUTH_ROUTE, [context.getHandler(), context.getClass()])

    if (!isSafeGuardedRoute) return true

    const { user } = context.switchToHttp().getRequest<Application.Request>()

    if (!SafeAuthGuard.isSafeProvider(user?.provider))
      throw new UnauthorizedException('You cannot access this resource', {
        description: `Unsafe Provider: ${user?.provider ?? 'unknown'}`,
      })

    return true
  }

  static isSafeProvider(provider: AuthProviders | undefined) {
    return Boolean(provider && SafeAuthProviders.has(provider))
  }
}
