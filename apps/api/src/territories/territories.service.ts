import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { subMilliseconds } from 'date-fns'
import { omit } from 'lodash-es'
import parseDuration from 'parse-duration'
import z from 'zod'

import { Configuration } from '~/config/configuration'
import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { House, StatusUpdate, Street, Territory } from '~/generated/prisma'
import { TenantHolderService } from '~/tenants/tenant-holder.service'

import { HouseCreatedEvent } from './events/houses/house-created.event'
import { HouseDeletedEvent } from './events/houses/house-deleted.event'
import { HouseStatusUpdatedEvent } from './events/houses/house-status-updated.event'
import { HouseUpdatedEvent } from './events/houses/house-updated.event'
import { StreetCreatedEvent } from './events/streets/street-created.event'
import { StreetDeletedEvent } from './events/streets/street-deleted.event'
import { StreetUpdatedEvent } from './events/streets/street-updated.event'
import { TerritoryCreatedEvent } from './events/territory/territory-created.event'
import { TerritoryDeletedEvent } from './events/territory/territory-deleted.event'
import { TerritoryUpdatedEvent } from './events/territory/territory-updated.event'
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
    protected readonly emitter: EventEmitter2,
  ) {}

  get congregationId() {
    return this.tenantHolder.getTenant().id
  }

  async getTerritories() {
    return await this.prisma.territory.findMany({
      where: { congregation: { id: this.congregationId } },
    })
  }

  async getTerritory(number: string) {
    return await this.prisma.territory.findFirst({
      where: { congregation: { id: this.congregationId }, number },
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
        image: true,
      },
    })
  }

  async createTerritory(data: Omit<Territory, 'id' | 'congregationId'>) {
    const { error, data: parsed } = this.territorySchema.safeParse(data)

    if (error) throw new ValidationException(error)

    const territory = await this.prisma.territory.create({
      data: {
        ...parsed,
        congregationId: this.congregationId,
      },
    })

    this.emitter.emit(TerritoryCreatedEvent.event, new TerritoryCreatedEvent({
      territory,
    }))

    return territory
  }

  async updateTerritory(id: Territory['id'], data: Partial<Omit<Territory, 'id' | 'congregationId'>>) {
    const { error, data: parsed } = this.territorySchema.partial().safeParse(data)

    if (error) throw new ValidationException(error)

    const territory = await this.prisma.territory.update({
      where: { id, congregation: { id: this.congregationId } },
      data: parsed,
    })

    this.emitter.emit(TerritoryUpdatedEvent.event, new TerritoryUpdatedEvent({
      territory,
    }))

    return territory
  }

  async deleteTerritory(id: number) {
    await this.prisma.territory.delete({ where: { id, congregation: { id: this.congregationId } } })

    this.emitter.emit(TerritoryDeletedEvent.event, new TerritoryDeletedEvent({
      id,
    }))

    return true
  }

  // #region streets
  async addStreet(territoryId: number, streetData: Omit<Street, 'id' | 'territoryId'>) {
    const { error, data: parsed } = this.streetSchema.safeParse(streetData)

    if (error) throw new ValidationException(error)

    const street = await this.prisma.street.create({
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

    this.emitter.emit(StreetCreatedEvent.event, new StreetCreatedEvent({
      street,
    }))

    return street
  }

  async updateStreet(territoryId: number, id: number, streetData: Partial<Omit<Street, 'id' | 'territoryId'>>) {
    const { error, data: parsed } = this.streetSchema.partial().safeParse(streetData)

    if (error) throw new ValidationException(error)

    const street = await this.prisma.street.update({
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

    this.emitter.emit(StreetUpdatedEvent.event, new StreetUpdatedEvent({
      street,
    }))

    return street
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

    this.emitter.emit(StreetDeletedEvent.event, new StreetDeletedEvent({
      id,
    }))

    return true
  }
  // #endregion streets

  // #region houses
  async addHouse(streetId: number, data: Omit<House, 'id' | 'street' | 'streetId' | 'updates'>) {
    const { error, data: parsed } = this.houseSchema.safeParse(data)

    if (error) throw new ValidationException(error)

    const house = await this.prisma.house.create({
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
      include: {
        street: {
          select: {
            territoryId: true,
          },
        },
      },
    })

    this.emitter.emit(HouseCreatedEvent.event, new HouseCreatedEvent({
      house,
      territoryId: house.street.territoryId,
    }))

    return omit(house, ['street'])
  }

  async updateHouse(houseId: number, data: Partial<Omit<House, 'id' | 'street' | 'streetId' | 'updates'>>) {
    const { error, data: parsed } = this.houseSchema.partial().safeParse(data)

    if (error) throw new ValidationException(error)

    const house = await this.prisma.house.update({
      where: {
        id: houseId,
        street: {
          territory: {
            congregation: { id: this.congregationId },
          },
        },
      },
      data: parsed,
      include: {
        street: {
          select: {
            territoryId: true,
          },
        },
      },
    })

    this.emitter.emit(HouseUpdatedEvent.event, new HouseUpdatedEvent({
      house,
      territoryId: house.street.territoryId,
    }))

    return omit(house, ['street'])
  }

  async deleteHouse(id: number) {
    await this.prisma.house.delete({
      where: {
        id,
        street: {
          territory: {
            congregation: { id: this.congregationId },
          },
        },
      },
    })

    this.emitter.emit(HouseDeletedEvent.event, new HouseDeletedEvent({
      id,
    }))

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

    let newStatus: StatusUpdate & { house: { street: { territoryId: Territory['id'] } } }

    if (replaceUpdate) {
      const updated = await this.prisma.statusUpdate.update({
        where: { id: replaceUpdate.id },
        data: {
          date,
          status,
        },
        include: {
          house: {
            select: {
              street: {
                select: {
                  territoryId: true,
                },
              },
            },
          },
        },
      })

      newStatus = updated
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
        include: {
          house: {
            select: {
              street: {
                select: {
                  territoryId: true,
                },
              },
            },
          },
        },
      })

      newStatus = created
    }

    this.emitter.emit(HouseStatusUpdatedEvent.event, new HouseStatusUpdatedEvent({
      houseId,
      territoryId: newStatus.house.street.territoryId,
      status: omit(newStatus, 'house'),
    }))

    return newStatus.date
  }
  // #endregion status
}
