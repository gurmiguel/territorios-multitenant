import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { tap } from 'rxjs/operators'

import { CongregationsService } from '~/congregations/congregations.service'

import { TenantHolderService } from './tenant-holder.service'
import { TenantsService } from './tenants.service'

@Injectable()
export class TenantsInterceptor implements NestInterceptor {
  constructor(
    protected readonly tenantHolder: TenantHolderService,
    protected readonly congregationsService: CongregationsService,
    protected readonly tenantsService: TenantsService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Application.Request>()

    const tenant = await this.congregationsService.find({ slug: this.tenantsService.getTenantIdFromRequest(request) })

    if (tenant)
      this.tenantHolder.setTenant(tenant)

    return next.handle()
      .pipe(
        tap(() => this.tenantHolder.clearTenant()),
      )
  }
}
