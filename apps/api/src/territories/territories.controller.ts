import { Controller, Get, Post, Request } from '@nestjs/common'

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

  @Post()
  async create(@Request() req: Application.Request) {
    const data = req.body

    return await this.territoriesService.createTerritory(data)
  }
}
