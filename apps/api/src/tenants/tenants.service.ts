import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.DEFAULT })
export class TenantsService {
  getTenantIdFromRequest(request: Application.Request) {
    let tenantId = request.headers['x-tenant-id']

    tenantId ??= {...request.query, ...request.body}.tenant?.toString()

    if (tenantId)
      return Array.isArray(tenantId) ? tenantId[0]! : tenantId

    let hostname = request.headers['x-forwarded-host'] || request.headers['x-forwarded-hostname'] || request.headers['x-forwarded-server'] || request.headers.host
    if (Array.isArray(hostname))
      hostname = hostname[0]

    const segments = hostname?.split('.') ?? []

    if (segments.length <= 1)
      return undefined

    tenantId = segments.shift()!

    return tenantId
  }
}
