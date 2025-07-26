import { Controller, Delete, Get, Param, Patch, Post, Request, Sse } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { omit } from 'lodash-es'
import { filter, map, merge } from 'rxjs'

import { Allow } from '~/auth/decorators/allow.decorator'
import { Action } from '~/auth/permissions/action.enum'
import { Area } from '~/auth/permissions/area.enum'
import { fromTypedEvent } from '~/utils/event'

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
import { TerritoriesService } from './territories.service'

@Controller('territories')
export class TerritoriesController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
    protected readonly emitter: EventEmitter2,
  ) {}

  @Allow([Area.TERRITORIES, Action.READ])
  @Get()
  async list() {
    return {
      items: await this.territoriesService.getTerritories(),
    }
  }

  @Allow([Area.TERRITORIES, Action.READ])
  @Get(':number')
  async get(@Param('number') number: string) {
    const data = await this.territoriesService.getTerritory(number)

    if (!data)
      throw new Error(`Territory with number ${number} not found`)

    const { image, ...territory } = data

    return {
      ...territory,
      imageUrl: image?.publicUrl ?? null,
    }
  }

  @Allow([Area.TERRITORIES, Action.WRITE])
  @Post()
  async create(@Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.createTerritory(data)
  }

  @Allow([Area.TERRITORIES, Action.WRITE])
  @Patch(':id')
  async update(@Param('id') id: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.updateTerritory(parseInt(id), data)
  }

  @Allow([Area.TERRITORIES, Action.DELETE])
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.territoriesService.deleteTerritory(parseInt(id))
  }

  @Allow([Area.TERRITORIES, Action.READ])
  @Sse('updates')
  listUpdates() {
    return merge(
      fromTypedEvent(this.emitter, TerritoryCreatedEvent)
        .pipe(map(e => new MessageEvent(e.event, { data: e.territory }))),
      fromTypedEvent(this.emitter, TerritoryDeletedEvent)
        .pipe(map(e => new MessageEvent(e.event, { data: e.id }))),
      // used to update main territory last updated at label
      fromTypedEvent(this.emitter, HouseStatusUpdatedEvent)
        .pipe(map(e => new MessageEvent(e.event, { data: omit(e, 'territoryId') }))),
    )
  }

  @Allow([Area.TERRITORIES, Action.READ])
  @Sse(':territoryId/updates')
  territoryUpdates(@Param('territoryId') territoryId: string) {
    const id = parseInt(territoryId)

    return merge(
      // territory
      fromTypedEvent(this.emitter, TerritoryUpdatedEvent)
        .pipe(filter(e => e.territory.id === id))
        .pipe(map(e => new MessageEvent(e.event, { data: e.territory }))),
      fromTypedEvent(this.emitter, TerritoryDeletedEvent)
        .pipe(filter(e => e.id === id))
        .pipe(map(e => new MessageEvent(e.event, { data: e.id }))),
      // streets
      fromTypedEvent(this.emitter, StreetCreatedEvent)
        .pipe(filter(e => e.street.territoryId === id))
        .pipe(map(e => new MessageEvent(e.event, { data: e.street }))),
      fromTypedEvent(this.emitter, StreetUpdatedEvent)
        .pipe(filter(e => e.street.territoryId === id))
        .pipe(map(e => new MessageEvent(e.event, { data: e.street }))),
      fromTypedEvent(this.emitter, StreetDeletedEvent)
        .pipe(map(e => new MessageEvent(e.event, { data: e.id }))),
      // houses
      fromTypedEvent(this.emitter, HouseCreatedEvent)
        .pipe(filter(e => e.territoryId === id))
        .pipe(map(e => new MessageEvent(e.event, { data: e.house }))),
      fromTypedEvent(this.emitter, HouseUpdatedEvent)
        .pipe(filter(e => e.territoryId === id))
        .pipe(map(e => new MessageEvent(e.event, { data: e.house }))),
      fromTypedEvent(this.emitter, HouseDeletedEvent)
        .pipe(map(e => new MessageEvent(e.event, { data: e }))),
      // updates
      fromTypedEvent(this.emitter, HouseStatusUpdatedEvent)
        .pipe(filter(e => e.territoryId === id))
        .pipe(map(e => new MessageEvent(e.event, { data: omit(e, 'territoryId') }))),
    )
  }
}
