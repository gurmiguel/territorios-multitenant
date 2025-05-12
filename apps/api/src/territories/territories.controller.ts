import { Controller, Delete, Get, Param, Patch, Post, Request } from '@nestjs/common'

import { TerritoriesService } from './territories.service'

@Controller('territories')
export class TerritoriesController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
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
}
