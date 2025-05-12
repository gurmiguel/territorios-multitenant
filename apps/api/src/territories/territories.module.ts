import { Module } from '@nestjs/common'

import { StreetsController } from './streets.controller'
import { TerritoriesController } from './territories.controller'
import { TerritoriesService } from './territories.service'

@Module({
  controllers: [TerritoriesController, StreetsController],
  providers: [TerritoriesService],
})
export class TerritoriesModule {}
