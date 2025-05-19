import { Controller, Delete, Param, Patch, Post, Request } from '@nestjs/common'

import { Allow } from '~/auth/decorators/allow.decorator'
import { Action } from '~/auth/permissions/action.enum'
import { Area } from '~/auth/permissions/area.enum'

import { TerritoriesService } from './territories.service'

@Controller('territories/:territoryId/streets/:streetId/houses')
export class HousesController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
  ) {}

  @Allow([Area.HOUSES, Action.WRITE])
  @Post()
  async add(@Param('streetId') streetId: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.addHouse(parseInt(streetId), data)
  }

  @Allow([Area.HOUSES, Action.WRITE])
  @Patch(':houseId')
  async update(@Param('houseId') houseId: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.updateHouse(parseInt(houseId), data)
  }

  @Allow([Area.HOUSES, Action.DELETE])
  @Delete(':houseId')
  async delete(@Param('houseId') houseId: string) {
    return await this.territoriesService.deleteHouse(parseInt(houseId))
  }

  @Post(':houseId/status')
  async updateStatus(@Param('houseId') houseId: string, @Request() req: Application.Request) {
    const { status, date = new Date() } = req.body
    const user = req.user!

    return await this.territoriesService.addStatusUpdate(parseInt(houseId), status, date, user.id)
  }
}
