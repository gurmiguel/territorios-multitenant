import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { SUPER_TOKEN_KEY } from '../decorators/super-token.decorator'

@Injectable()
export class SuperTokenAuthGuard extends AuthGuard('super') {
  constructor(protected readonly reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isSuperTokenGuarded = this.reflector.getAllAndOverride<boolean | void>(SUPER_TOKEN_KEY, [context.getClass(), context.getHandler()])

    if (isSuperTokenGuarded)
      return super.canActivate(context)

    return true
  }
}
