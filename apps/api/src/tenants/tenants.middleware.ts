import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common'

import { CongregationsService } from '~/congregations/congregations.service'

import { TenantHolderService } from './tenant-holder.service'

@Injectable()
export class TenantsMiddleware implements NestMiddleware {
  constructor(
    private readonly tenantHolder: TenantHolderService,
    private readonly congregationsService: CongregationsService,
  ) {}

  async use(request: Application.Request, _response: Application.Response, next: ()=> void) {
    if (!this.shouldInterceptRequest(request))
      return next()

    const tenantId = this.getTenantFromRequest(request)

    const tenant = tenantId
      ? await this.congregationsService.find({ slug: tenantId })
      : null

    if (!tenant)
      throw new ForbiddenException('Tenant Id not found')

    this.tenantHolder.setTenant(request.id, tenant)

    next()
  }

  private getTenantFromRequest(request: Application.Request) {
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

  private shouldInterceptRequest(request: Application.Request) {
    if (this.tenantHolder.hasTenant(request.id))
      return false

    return true
  }
}
