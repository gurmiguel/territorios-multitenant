import { Global, Module } from '@nestjs/common'
import { APP_INTERCEPTOR } from '@nestjs/core'

import { CongregationsModule } from '~/congregations/congregations.module'

import { TenantHolderService } from './tenant-holder.service'
import { TenantsInterceptor } from './tenants.interceptor'

@Global()
@Module({
  imports: [CongregationsModule],
  providers: [
    TenantHolderService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TenantsInterceptor,
    },
  ],
  exports: [TenantHolderService],
})
export class TenantsModule {}
