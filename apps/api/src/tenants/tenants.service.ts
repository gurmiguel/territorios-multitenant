import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.DEFAULT })
export class TenantsService {
  getTenantHostFromRequest(request: Application.Request) {
    let tenantHost = request.headers['x-tenant-host'] || request.headers['referer'] || null

    if (Array.isArray(tenantHost))
      tenantHost = tenantHost[0] || null

    if (tenantHost?.startsWith('http'))
      tenantHost = new URL(tenantHost).host

    return tenantHost
  }
}
