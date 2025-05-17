import { Controller, Delete, Get, Param, Patch, Post, Request, Sse } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { filter, map, merge } from 'rxjs'

import { fromTypedEvent } from '~/utils/event'

import { TerritoryDeletedEvent } from './events/territory/territory-deleted.event'
import { TerritoryUpdatedEvent } from './events/territory/territory-updated.event'
import { TerritoriesService } from './territories.service'

@Controller('territories')
export class TerritoriesController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
    protected readonly emitter: EventEmitter2,
  ) {}

  @Get()
  async list() {
    return {
      items: await this.territoriesService.getTerritories(),
    }
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.territoriesService.getTerritory(parseInt(id))
  }

  @Post()
  async create(@Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.createTerritory(data)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.updateTerritory(parseInt(id), data)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.territoriesService.deleteTerritory(parseInt(id))
  }

  @Sse(':territoryId/updates')
  updates(@Param('territoryId') territoryId: string) {
    const id = parseInt(territoryId)

    return merge(
      fromTypedEvent(this.emitter, TerritoryUpdatedEvent)
        .pipe(filter(e => e.territory.id === id))
        .pipe(map(e => new MessageEvent(e.event, { data: { territory: e.territory } }))),
      fromTypedEvent(this.emitter, TerritoryDeletedEvent)
        .pipe(filter(e => e.id === id))
        .pipe(map(e => new MessageEvent(e.event, { data: { id } }))),
    )
  }
  // TODO: implement SSE for sending real-time updates to clients
}
