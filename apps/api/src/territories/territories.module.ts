import { Module } from '@nestjs/common'

import { HousesController } from './houses.controller'
import { StreetsController } from './streets.controller'
import { TerritoriesController } from './territories.controller'
import { TerritoriesService } from './territories.service'

@Module({
  controllers: [TerritoriesController, StreetsController, HousesController],
  providers: [TerritoriesService],
})
export class TerritoriesModule {}
