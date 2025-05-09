import { Global, Injectable, Scope } from '@nestjs/common'

import { Congregation } from '~/generated/prisma'

@Global()
@Injectable({ scope: Scope.REQUEST })
export class TenantHolderService {
  protected tenant?: Congregation

  getTenant() {
    if (!this.hasTenant())
      throw new TypeError('Tenant Id not defined, is this service intercepted by TenantsInterceptor?')

    return this.tenant
  }

  setTenant(tenant: Congregation) {
    this.tenant = tenant
  }

  hasTenant(): this is { tenant: Congregation } {
    return this.tenant !== undefined
  }

  clearTenant() {
    this.tenant = undefined
  }
}
