import { Global, Module, Scope } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CongregationsModule } from '~/congregations/congregations.module'

import { TenantHolderService } from './tenant-holder.service'
import { TenantsInterceptor } from './tenants.interceptor'
import { TenantsService } from './tenants.service'

@Global()
@Module({
  imports: [CongregationsModule],
  providers: [
    TenantHolderService,
    TenantsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantsInterceptor,
      scope: Scope.REQUEST,
    },
  ],
  exports: [TenantHolderService, TenantsService],
})
export class TenantsModule {}
