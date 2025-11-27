import { Injectable, Scope } from '@nestjs/common'

@Injectable({ scope: Scope.DEFAULT })
export class TenantsService {
  getTenantIdFromRequest(request: Application.Request) {
    let tenantHost = request.headers['x-forwarded-host'] || request.headers['x-forwarded-hostname'] || request.headers['x-forwarded-server'] || request.headers.host || null

    if (process.env.NODE_ENV !== 'production') // in test environment, accept tenant from query parameter
      tenantHost = request.query.tenant?.toString() || tenantHost

    if (Array.isArray(tenantHost))
      tenantHost = tenantHost[0] || null

    return tenantHost
  }
}
