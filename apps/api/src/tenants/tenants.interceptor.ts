import { CallHandler, ExecutionContext, Injectable, NestInterceptor, SetMetadata } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { tap } from 'rxjs/operators'

import { CongregationsService } from '~/congregations/congregations.service'
import { Congregation } from '~/generated/prisma/client'

import { TenantHolderService } from './tenant-holder.service'
import { TenantsService } from './tenants.service'

const BYPASS_TENANT = Symbol.for('bypass_tenant')

@Injectable()
export class TenantsInterceptor implements NestInterceptor {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly tenantHolder: TenantHolderService,
    protected readonly tenantsService: TenantsService,
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

    let tenant: Congregation | null = null

    if (user) {
      tenant = await this.congregationsService.find({ where: { id: user.congregationId } })
    } else {
      const tenantId = this.tenantsService.getTenantIdFromRequest(request)

      if (tenantId)
        tenant = await this.congregationsService.find({ where: { slug: tenantId } })
    }

    if (tenant)
      this.tenantHolder.setTenant(tenant)

    return next.handle()
      .pipe(
        tap(() => this.tenantHolder.clearTenant()),
      )
  }
}

export const ByPassTenant = () => SetMetadata(BYPASS_TENANT, true)
