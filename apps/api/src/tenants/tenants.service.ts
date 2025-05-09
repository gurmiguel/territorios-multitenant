import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.DEFAULT })
export class TenantsService {
  getTenantIdFromRequest(request: Application.Request) {
    let tenantId = request.headers['x-tenant-id']

    tenantId ??= {...request.query, ...request.body}.tenant?.toString()

    if (tenantId)
      return Array.isArray(tenantId) ? tenantId[0]! : tenantId

    const hostname = request.hostname

    const segments = hostname.split('.')

    if (segments.length <= 1)
      return undefined

    tenantId = segments.shift()!

    return tenantId
  }
}
