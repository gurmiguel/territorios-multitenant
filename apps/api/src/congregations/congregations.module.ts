import { Module } from '@nestjs/common'

import { CongregationsService } from './congregations.service'

@Module({
  providers: [CongregationsService],
  exports: [CongregationsService],
})
export class CongregationsModule {}
