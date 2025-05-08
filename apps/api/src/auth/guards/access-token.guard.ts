import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard, IAuthGuard } from '@nestjs/passport'
import { Observable } from 'rxjs'

@Injectable()
export class AccessTokenAuthGuard extends AuthGuard('access_token') {
  constructor(
    private readonly reflector: Reflector,
  ) {
    super()
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const useGuards = this.reflector.getAllAndMerge<Function[]>('__guards__', [context.getHandler(), context.getClass()])

    if (this.hasAuthGuards(useGuards))
      return true

    return super.canActivate(context)
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
