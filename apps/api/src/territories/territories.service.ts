import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'
import { TenantHolderService } from '~/tenants/tenant-holder.service'

@Injectable()
export class TerritoriesService {
  constructor(
    protected readonly tenantHolder: TenantHolderService,
    protected readonly prisma: PrismaService,
  ) {}

  async getTerritories() {
    return await this.prisma.territory.findMany({
      where: { congregation: { id: this.tenantHolder.getTenant()?.id } },
    })
  }
}
