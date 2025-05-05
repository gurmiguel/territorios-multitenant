import { Global, Injectable, Scope } from '@nestjs/common'

import { Congregation } from '~/generated/prisma'

@Global()
@Injectable({ scope: Scope.DEFAULT })
export class TenantHolderService {
  private requestsTenant = new Map<string, Congregation>()

  getTenant(requestId: string) {
    if (!this.hasTenant(requestId))
      throw new TypeError('Tenant Id not defined, is this service intercepted by TenantsMiddleware?')

    return this.requestsTenant.get(requestId)!
  }

  setTenant(requestId: string, tenant: Congregation) {
    this.requestsTenant.set(requestId, tenant)
  }

  hasTenant(requestId: string) {
    return this.requestsTenant.has(requestId)
  }

  clearTenant(requestId: string) {
    this.requestsTenant.delete(requestId)
  }
}
