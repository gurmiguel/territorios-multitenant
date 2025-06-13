import { Module } from '@nestjs/common'

import { CongregationsController } from './congregations.controller'
import { CongregationsService } from './congregations.service'

@Module({
  providers: [CongregationsService],
  exports: [CongregationsService],
  controllers: [CongregationsController],
})
export class CongregationsModule {}
