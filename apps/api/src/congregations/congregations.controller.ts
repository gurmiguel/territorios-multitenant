import { Controller, Get, NotFoundException, Post, Request } from '@nestjs/common'

import { AllowAnonymous } from '~/auth/decorators/allow-anonymous.decorator'
import { SafeAuth } from '~/auth/decorators/safe-auth.decorator'
import { SuperTokenAuth } from '~/auth/decorators/super-token.decorator'
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
    const tenantHost = this.tenantsService.getTenantHostFromRequest(req) ?? null

    const congregation = tenantHost ? await this.congregationsService.find({ where: { domains: { has: tenantHost} } }) : null

    if (!congregation)
      throw new NotFoundException('Congregation not found')

    const map = await this.congregationsService.getMap(congregation.id)

    return { ...congregation, map }
  }

  @Post()
  @SafeAuth()
  @SuperTokenAuth()
  async create(@Request() req: Application.Request) {
    const newCongregation = await this.congregationsService.create(req.body)

    return newCongregation
  }
}
