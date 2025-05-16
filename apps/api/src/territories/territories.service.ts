import { Injectable } from '@nestjs/common'
import z from 'zod'

import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { House, Street, Territory } from '~/generated/prisma'
import { TenantHolderService } from '~/tenants/tenant-holder.service'

import { HouseTypes } from './house-types'

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

  protected houseSchema = z.object({
    type: z.string().refine(string => string in HouseTypes),
    number: z.string().min(1).regex(/(\d|S\/N)/i),
    phones: z.array(z.string().regex(/\d{2} 9?\d{4}\-\d{4}/))
      .transform(arr => arr.map(s => s.replace(/\D/g, ''))),
    complement: z.string(),
    observation: z.string(),
  })

  constructor(
    protected readonly tenantHolder: TenantHolderService,
    protected readonly prisma: PrismaService,
  ) {}

  async getTerritories() {
    return await this.prisma.territory.findMany({
      where: { congregation: { id: this.tenantHolder.getTenant().id } },
    })
  }

  async getTerritory(id: number) {
    return await this.prisma.territory.findFirst({
      where: { congregation: { id: this.tenantHolder.getTenant().id }, id },
      include: {
        streets: {
          include: {
            houses: {
              include: {
                updates: {
                  take: 1,
                  orderBy: [{ date: 'desc' }],
                },
              },
            },
          },
        },
      },
    })
  }

  async createTerritory(data: Omit<Territory, 'id' | 'congregationId'>) {
    const { error, data: parsed } = this.territorySchema.safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.territory.create({
      data: {
        ...parsed,
        congregationId: this.tenantHolder.getTenant().id,
      },
    })
  }

  async updateTerritory(id: Territory['id'], data: Partial<Omit<Territory, 'id' | 'congregationId'>>) {
    const { error, data: parsed } = this.territorySchema.partial().safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.territory.update({
      where: { id },
      data: parsed,
    })
  }

  async deleteTerritory(id: number) {
    await this.prisma.territory.delete({ where: { id } })

    return true
  }

  // #region streets
  async addStreet(territoryId: number, streetData: Omit<Street, 'id' | 'territoryId'>) {
    const { error, data: parsed } = this.streetSchema.safeParse(streetData)

    if (error) throw new ValidationException(error)

    return await this.prisma.street.create({
      data: {
        territoryId,
        ...parsed,
      },
    })
  }

  async updateStreet(territoryId: number, id: number, streetData: Partial<Omit<Street, 'id' | 'territoryId'>>) {
    const { error, data: parsed } = this.streetSchema.partial().safeParse(streetData)

    if (error) throw new ValidationException(error)

    return await this.prisma.street.update({
      where: { territoryId, id },
      data: {
        ...parsed,
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

  // #region houses
  async addHouse(streetId: number, data: Omit<House, 'id' | 'streetId'>) {
    const { error, data: parsed } = this.houseSchema.safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.house.create({
      data: {
        streetId,
        ...parsed,
      },
    })
  }
  // #endregion houses
}
