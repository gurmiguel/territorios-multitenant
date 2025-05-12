import { Injectable } from '@nestjs/common'
import z from 'zod'

import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { Territory } from '~/generated/prisma'
import { TenantHolderService } from '~/tenants/tenant-holder.service'

@Injectable()
export class TerritoriesService {
  protected readonly territorySchema = z.object({
    number: z.string(),
    color: z.string().regex(/^#([0-9a-f]{3}){1,2}/i),
    hidden: z.boolean(),
    map: z.string().url().nullable(),
  })

  constructor(
    protected readonly tenantHolder: TenantHolderService,
    protected readonly prisma: PrismaService,
  ) {}

  async getTerritories() {
    return await this.prisma.territory.findMany({
      where: { congregation: { id: this.tenantHolder.getTenant()?.id } },
    })
  }

  async createTerritory(data: Omit<Territory, 'id' | 'congregationId'>) {
    const { error } = this.territorySchema.safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.territory.create({
      data: {
        ...data,
        congregationId: this.tenantHolder.getTenant().id,
      },
    })
  }

  async updateTerritory(id: Territory['id'], data: Partial<Omit<Territory, 'id' | 'congregationId'>>) {
    const { error } = this.territorySchema.partial().safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.territory.update({
      where: { id },
      data: data,
    })
  }

  async deleteTerritory(id: number) {
    await this.prisma.territory.delete({ where: { id } })

    return true
  }
}
