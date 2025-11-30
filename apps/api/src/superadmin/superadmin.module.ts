import { Module } from '@nestjs/common'

import { SuperadminService } from './superadmin.service'

@Module({
  providers: [SuperadminService],
  exports: [SuperadminService],
})
export class SuperadminModule {}
