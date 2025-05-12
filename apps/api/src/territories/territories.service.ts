import { Injectable } from '@nestjs/common'
import z from 'zod'

import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { Street, Territory } from '~/generated/prisma'
import { TenantHolderService } from '~/tenants/tenant-holder.service'

@Injectable()
export class TerritoriesService {
  protected readonly territorySchema = z.object({
    number: z.string(),
    color: z.string().regex(/^#([0-9a-f]{3}){1,2}/i),
    hidden: z.boolean(),
    map: z.string().url().nullable(),
  })

  protected readonly streetSchema = z.object({
    name: z.string(),
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

  // #region streets
  async addStreet(territoryId: number, streetData: Omit<Street, 'id' | 'territoryId'>) {
    const { error } = this.streetSchema.safeParse(streetData)

    if (error) throw new ValidationException(error)

    return await this.prisma.street.create({
      data: {
        territoryId,
        ...streetData,
      },
    })
  }

  async updateStreet(territoryId: number, id: number, streetData: Partial<Omit<Street, 'id' | 'territoryId'>>) {
    const { error } = this.streetSchema.partial().safeParse(streetData)

    if (error) throw new ValidationException(error)

    return await this.prisma.street.update({
      where: { territoryId, id },
      data: {
        ...streetData,
      },
    })
  }

  async deleteStreet(territoryId: number, id: number) {
    await this.prisma.street.delete({
      where: { territoryId, id },
    })

    return true
  }
  // #endregion streets
}
