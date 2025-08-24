import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { IPermission, Permission, PermissionMode } from '@repo/utils/permissions/index'

import { PERMISSIONS_KEY, PERMISSIONS_MODE_KEY } from '../decorators/allow.decorator'

@Injectable()
export class AllowGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext) {
    const permissions = this.reflector.getAllAndOverride<IPermission[]>(PERMISSIONS_KEY, [context.getHandler(), context.getClass()])
    const mode = this.reflector.getAllAndOverride<PermissionMode>(PERMISSIONS_MODE_KEY, [context.getHandler(), context.getClass()])

    if (!permissions || !mode) return true

    const { user } = context.switchToHttp().getRequest<Application.Request>()

    const canActivate = {
      [PermissionMode.ALL]: () => permissions.every(p => user?.permissions.includes(Permission(p))),
      [PermissionMode.ANY]: () => permissions.some(p => user?.permissions.includes(Permission(p))),
    }[mode]?.() ?? false

    if (!canActivate)
      throw new UnauthorizedException('You cannot access this resource')

    return true
  }
}
