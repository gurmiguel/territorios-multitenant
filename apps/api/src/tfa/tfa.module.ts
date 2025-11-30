import { Module } from '@nestjs/common'

import { AuthModule } from '~/auth/auth.module'
import { SuperadminModule } from '~/superadmin/superadmin.module'

import { TfaController } from './tfa.controller'
import { TfaService } from './tfa.service'

@Module({
  imports: [SuperadminModule, AuthModule],
  controllers: [TfaController],
  providers: [TfaService],
  exports: [TfaService],
})
export class TfaModule {}
