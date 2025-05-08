import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.DEFAULT })
export class TenantsService {
  getTenantIdFromRequest(request: Application.Request) {
    let tenantId = request.headers['x-tenant-id']

    if (tenantId)
      return Array.isArray(tenantId) ? tenantId[0]! : tenantId

    tenantId = request.query.tenant?.toString()

    if (tenantId)
      return tenantId

    const hostname = request.hostname

    tenantId = hostname.split('.').shift()!

    return tenantId
  }
}
