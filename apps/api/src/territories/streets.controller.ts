import { Controller, Delete, Param, Patch, Post, Request } from '@nestjs/common'

import { TerritoriesService } from './territories.service'

@Controller('territories/:territoryId/streets')
export class StreetsController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
  ) {}

  @Post()
  async add(@Param('territoryId') territoryId: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.addStreet(parseInt(territoryId), data)
  }

  @Patch(':id')
  async update(@Param('territoryId') territoryId: string, @Param('id') id: string, @Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.updateStreet(parseInt(territoryId), parseInt(id), data)
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return await this.territoriesService.deleteStreet(parseInt(id))
  }
}
