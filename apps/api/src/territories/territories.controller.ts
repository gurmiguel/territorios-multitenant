import { Controller, Get } from '@nestjs/common'

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
}
