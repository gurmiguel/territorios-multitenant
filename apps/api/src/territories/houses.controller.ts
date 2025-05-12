import { Controller } from '@nestjs/common'

import { TerritoriesService } from './territories.service'

@Controller('territories/:territoryId/streets/:streetId/houses')
export class HousesController {
  constructor(
    protected readonly territoriesService: TerritoriesService,
  ) {}
}
