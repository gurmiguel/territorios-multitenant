import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { HouseTypes } from '@repo/utils/types'
import { subMilliseconds } from 'date-fns'
import { omit } from 'lodash-es'
import parseDuration from 'parse-duration'
import { z } from 'zod'

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

@Injectable()
export class TerritoriesService {
  protected readonly territorySchema = z.object({
    number: z.string(),
    color: z.string().regex(/^#([0-9a-f]{3}){1,2}/i),
    hidden: z.boolean(),
    map: z.string()
      .refine(v => v.startsWith('http'), {
        error: 'Invalid URL',
        when: ({ value }) => typeof value === 'string' && value.length > 0,
      }),
    removeImage: z.boolean().optional(),
  })

  protected readonly streetSchema = z.object({
    name: z.string(),
  })

  protected houseSchema = z.object({
    type: z.enum(HouseTypes),
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
      orderBy: [{ number: 'asc' }],
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
    const { error, data: parsed } = await this.territorySchema.safeParseAsync(data)

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
    const { error, data: { removeImage = false, ...parsed } = {} } = await this.territorySchema.partial().safeParseAsync(data)

    if (error) throw new ValidationException(error)

    const territory = await this.prisma.territory.update({
      where: { id, congregation: { id: this.congregationId } },
      data: removeImage
        ? { ...parsed, image: { delete: true } }
        : parsed,
    })

    this.emitter.emit(TerritoryUpdatedEvent.event, new TerritoryUpdatedEvent({
      territory,
    }))

    return territory
  }

  async deleteTerritory(id: number) {
    const res = await this.prisma.territory.delete({
      where: { id, congregation: { id: this.congregationId } },
      select: {
        number: true,
      },
    })

    this.emitter.emit(TerritoryDeletedEvent.event, new TerritoryDeletedEvent({
      id,
      territoryNumber: res.number,
    }))

    return true
  }

  // #region streets
  async addStreet(territoryId: number, streetData: Omit<Street, 'id' | 'territoryId'>) {
    const { error, data: parsed } = await this.streetSchema.safeParseAsync(streetData)

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
      include: {
        territory: { select: { number: true } },
        houses: true,
      },
    })

    this.emitter.emit(StreetCreatedEvent.event, new StreetCreatedEvent({
      street,
      territoryNumber: street.territory.number,
    }))

    return street
  }

  async updateStreet(territoryId: number, id: number, streetData: Partial<Omit<Street, 'id' | 'territoryId'>>) {
    const { error, data: parsed } = await this.streetSchema.partial().safeParseAsync(streetData)

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
      include: {
        territory: { select: { number: true } },
      },
    })

    this.emitter.emit(StreetUpdatedEvent.event, new StreetUpdatedEvent({
      street,
      territoryNumber: street.territory.number,
    }))

    return street
  }

  async deleteStreet(id: number) {
    const res = await this.prisma.street.delete({
      where: {
        id,
        territory: {
          congregation: { id: this.congregationId },
        },
      },
      select: {
        territory: { select: { number: true } },
      },
    })

    this.emitter.emit(StreetDeletedEvent.event, new StreetDeletedEvent({
      id,
      territoryNumber: res.territory.number,
    }))

    return true
  }
  // #endregion streets

  // #region houses
  async addHouse(streetId: number, data: Omit<House, 'id' | 'street' | 'streetId' | 'updates'>) {
    const { error, data: parsed } = await this.houseSchema.safeParseAsync(data)

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
            territory: { select: { id: true, number: true } },
          },
        },
      },
    })

    this.emitter.emit(HouseCreatedEvent.event, new HouseCreatedEvent({
      house,
      territoryId: house.street.territory.id,
      territoryNumber: house.street.territory.number,
    }))

    return omit(house, ['street'])
  }

  async updateHouse(houseId: number, data: Partial<Omit<House, 'id' | 'street' | 'streetId' | 'updates'>>) {
    const { error, data: parsed } = await this.houseSchema.partial().safeParseAsync(data)

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
            territory: { select: { id: true, number: true } },
          },
        },
      },
    })

    this.emitter.emit(HouseUpdatedEvent.event, new HouseUpdatedEvent({
      house,
      territoryId: house.street.territory.id,
      territoryNumber: house.street.territory.number,
    }))

    return omit(house, ['street'])
  }

  async deleteHouse(id: number) {
    const res = await this.prisma.house.delete({
      where: {
        id,
        street: {
          territory: {
            congregation: { id: this.congregationId },
          },
        },
      },
      select: {
        street: {
          select: {
            territory: { select: { number: true } },
          },
        },
      },
    })

    this.emitter.emit(HouseDeletedEvent.event, new HouseDeletedEvent({
      id,
      territoryNumber: res.street.territory.number,
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

    let newStatus: StatusUpdate & { house: { street: { id: number, territory: Territory } } }

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
                  id: true,
                  territory: true,
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
                  id: true,
                  territory: true,
                },
              },
            },
          },
        },
      })

      newStatus = created
    }

    const statusCount = await this.prisma.statusUpdate.count({ where: { houseId } })

    const limit = this.config.get('constants', { infer: true }).statusBleedingLimit

    if (statusCount > limit) {
      await this.prisma.statusUpdate.deleteMany({
        where: { houseId, AND: [{ NOT: { id: newStatus.id } }] },
        limit: statusCount - limit,
      })
    }

    this.emitter.emit(HouseStatusUpdatedEvent.event, new HouseStatusUpdatedEvent({
      houseId,
      streetId: newStatus.house.street.id,
      territoryId: newStatus.house.street.territory.id,
      territoryNumber: newStatus.house.street.territory.number,
      status: omit(newStatus, 'house'),
    }))

    return omit(newStatus, ['house'])
  }
  // #endregion status
}
