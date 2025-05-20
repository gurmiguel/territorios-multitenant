import { CallHandler, ExecutionContext, Injectable, NestInterceptor, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { tap } from 'rxjs/operators'

import { CongregationsService } from '~/congregations/congregations.service'

import { TenantHolderService } from './tenant-holder.service'

const BYPASS_TENANT = Symbol.for('bypass_tenant')

@Injectable()
export class TenantsInterceptor implements NestInterceptor {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly tenantHolder: TenantHolderService,
    protected readonly congregationsService: CongregationsService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Application.Request>()

    const bypass = this.reflector.getAllAndOverride<boolean>(BYPASS_TENANT, [
      context.getHandler(),
      context.getClass(),
    ])

    if (bypass)
      return next.handle()

    const user = request.user

    if (user) {
      const tenant = await this.congregationsService.find({ where: { id: user.congregationId } })

      if (tenant)
        this.tenantHolder.setTenant(tenant)
    }

    return next.handle()
      .pipe(
        tap(() => this.tenantHolder.clearTenant()),
      )
  }
}

export const ByPassTenant = () => SetMetadata(BYPASS_TENANT, true)
