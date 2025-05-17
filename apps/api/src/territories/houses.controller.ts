import { Controller, Delete, Param, Patch, Post, Request } from '@nestjs/common'

import { TerritoriesService } from './territories.service'

@Controller('territories/:territoryId/streets/:streetId/houses')
export class HousesController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
  ) {}

  @Post()
  async add(@Param('streetId') streetId: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.addHouse(parseInt(streetId), data)
  }

  @Patch(':houseId')
  async update(@Param('houseId') houseId: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.updateHouse(parseInt(houseId), data)
  }

  @Delete(':houseId')
  async delete(@Param('houseId') houseId: string) {
    return await this.territoriesService.deleteHouse(parseInt(houseId))
  }
}
