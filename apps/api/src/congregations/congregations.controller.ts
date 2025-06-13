import { Controller, Get, NotFoundException, Request } from '@nestjs/common'

import { AllowAnonymous } from '~/auth/decorators/allow-anonymous.decorator'
import { TenantsService } from '~/tenants/tenants.service'

import { CongregationsService } from './congregations.service'

@Controller('congregations')
export class CongregationsController {
  constructor(
    protected readonly tenantsService: TenantsService,
    protected readonly congregationsService: CongregationsService,
  ) {}

  @AllowAnonymous()
  @Get()
  async get(@Request() req: Application.Request) {
    const tenantId = this.tenantsService.getTenantIdFromRequest(req) ?? null

    const congregation = tenantId ? await this.congregationsService.find({ where: { slug: tenantId } }) : null

    if (!congregation)
      throw new NotFoundException('Congregation not found')

    const map = await this.congregationsService.getMap(congregation.id)

    return { ...congregation, map }
  }
}
