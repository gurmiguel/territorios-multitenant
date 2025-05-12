import { Controller, Param, Post, Request } from '@nestjs/common'

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
}
