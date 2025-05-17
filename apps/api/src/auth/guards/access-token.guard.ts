import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard, IAuthGuard } from '@nestjs/passport'

import { ALLOW_ANONYMOUS_KEY } from './allow-anonymous.guard'

@Injectable()
export class AccessTokenAuthGuard extends AuthGuard('access_token') {
  constructor(
    private readonly reflector: Reflector,
  ) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const useGuards = this.reflector.getAllAndMerge<Function[]>('__guards__', [context.getHandler(), context.getClass()])

    if (this.hasAuthGuards(useGuards))
      return true

    try {
      return (await super.canActivate(context)) as boolean
    } catch (ex) {
      const allowAnonymous = this.reflector.getAllAndOverride<boolean>(ALLOW_ANONYMOUS_KEY, [context.getHandler(), context.getClass()]) ?? false

      if (allowAnonymous) return true

      throw ex
    }
  }

  private hasAuthGuards(guards: Function[]) {
    const authGuardMethods: Record<keyof IAuthGuard, unknown> = {
      canActivate: null,
      logIn: null,
      handleRequest: null,
      getAuthenticateOptions: null,
      getRequest: null,
    }

    const hasGuardRespectingAuthGuard = guards.some(g => {
      for (const method in authGuardMethods) {
        if (false === method in g.prototype)
          return false
      }

      return true
    })

    return hasGuardRespectingAuthGuard
  }
}
