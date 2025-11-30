import { Controller, Delete, Param, Patch, Post, Request } from '@nestjs/common'
import { Action, Area } from '@repo/utils/permissions/index'

import { Allow } from '~/auth/decorators/allow.decorator'

import { TerritoriesService } from './territories.service'

@Controller('territories/:territoryId/streets')
export class StreetsController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
  ) {}

  @Allow([Area.STREETS, Action.WRITE])
  @Post()
  async add(@Param('territoryId') territoryId: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.addStreet(parseInt(territoryId), data)
  }

  @Allow([Area.STREETS, Action.WRITE])
  @Patch(':id')
  async update(@Param('territoryId') territoryId: string, @Param('id') id: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.updateStreet(parseInt(territoryId), parseInt(id), data)
  }

  @Allow([Area.STREETS, Action.DELETE])
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.territoriesService.deleteStreet(parseInt(id))
  }
}
