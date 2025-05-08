import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { tap } from 'rxjs/operators'

import { TenantHolderService } from './tenant-holder.service'

@Injectable()
export class TenantsInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantHolder: TenantHolderService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest<Application.Request>()

    return next.handle()
      .pipe(
        tap(() => this.tenantHolder.clearTenant(request.id)),
      )
  }
}
