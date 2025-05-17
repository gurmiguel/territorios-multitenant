import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { subMilliseconds } from 'date-fns'
import parseDuration from 'parse-duration'
import z from 'zod'

import { Configuration } from '~/config/configuration'
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
    protected readonly config: ConfigService<Configuration, true>,
  ) {}

  get congregationId() {
    return this.tenantHolder.getTenant().id
  }

  async getTerritories() {
    return await this.prisma.territory.findMany({
      where: { congregation: { id: this.congregationId } },
    })
  }

  async getTerritory(id: number) {
    return await this.prisma.territory.findFirst({
      where: { congregation: { id: this.congregationId }, id },
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
        congregationId: this.congregationId,
      },
    })
  }

  async updateTerritory(id: Territory['id'], data: Partial<Omit<Territory, 'id' | 'congregationId'>>) {
    const { error, data: parsed } = this.territorySchema.partial().safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.territory.update({
      where: { id, congregation: { id: this.congregationId } },
      data: parsed,
    })
  }

  async deleteTerritory(id: number) {
    await this.prisma.territory.delete({ where: { id, congregation: { id: this.congregationId } } })

    return true
  }

  // #region streets
  async addStreet(territoryId: number, streetData: Omit<Street, 'id' | 'territoryId'>) {
    const { error, data: parsed } = this.streetSchema.safeParse(streetData)

    if (error) throw new ValidationException(error)

    return await this.prisma.street.create({
      data: {
        territory: {
          connect: {
            id: territoryId,
            congregation: { id: this.congregationId },
          },
        },
        ...parsed,
      },
    })
  }

  async updateStreet(territoryId: number, id: number, streetData: Partial<Omit<Street, 'id' | 'territoryId'>>) {
    const { error, data: parsed } = this.streetSchema.partial().safeParse(streetData)

    if (error) throw new ValidationException(error)

    return await this.prisma.street.update({
      where: {
        territory: {
          id: territoryId,
          congregation: { id: this.congregationId },
        },
        id,
      },
      data: {
        ...parsed,
      },
    })
  }

  async deleteStreet(id: number) {
    await this.prisma.street.delete({
      where: {
        id,
        territory: {
          congregation: { id: this.congregationId },
        },
      },
    })

    return true
  }
  // #endregion streets

  // #region houses
  async addHouse(streetId: number, data: Omit<House, 'id' | 'street' | 'streetId' | 'updates'>) {
    const { error, data: parsed } = this.houseSchema.safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.house.create({
      data: {
        street: {
          connect: {
            id: streetId,
            territory: {
              congregation: { id: this.congregationId },
            },
          },
        },
        ...parsed,
      },
    })
  }

  async updateHouse(houseId: number, data: Partial<Omit<House, 'id' | 'street' | 'streetId' | 'updates'>>) {
    const { error, data: parsed } = this.houseSchema.partial().safeParse(data)

    if (error) throw new ValidationException(error)

    return await this.prisma.house.update({
      where: {
        id: houseId,
        street: {
          territory: {
            congregation: { id: this.congregationId },
          },
        },
      },
      data: parsed,
    })
  }

  async deleteHouse(houseId: number) {
    await this.prisma.house.delete({
      where: {
        id: houseId,
        street: {
          territory: {
            congregation: { id: this.congregationId },
          },
        },
      },
    })

    return true
  }
  // #endregion houses

  // #region status
  async addStatusUpdate(houseId: number, status: string, atDate: string | Date, userId: string) {
    const date = new Date(atDate)
    const durationThreshold = parseDuration(this.config.get('constants', { infer: true }).statusThreshold) ?? 60 * 1000
    const threshold = subMilliseconds(date, durationThreshold)

    const replaceUpdate = await this.prisma.statusUpdate.findFirst({
      where: {
        houseId,
        userId,
        date: { gte: threshold },
        house: {
          street: {
            territory: {
              congregation: { id: this.congregationId },
            },
          },
        },
      },
    })

    if (replaceUpdate) {
      const updated = await this.prisma.statusUpdate.update({
        where: { id: replaceUpdate.id },
        data: {
          date,
          status,
        },
      })

      return updated.date
    } else {
      const created = await this.prisma.statusUpdate.create({
        data: {
          date,
          status,
          house: {
            connect: {
              id: houseId,
              street: {
                territory: {
                  congregation: { id: this.congregationId },
                },
              },
            },
          },
          user: {
            connect: {
              id: userId,
            },
          },
        },
      })

      return created.date
    }
  }
  // #endregion status
}
