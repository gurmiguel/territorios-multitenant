
import { Module, OnApplicationBootstrap } from '@nestjs/common'
import { MulterModule } from '@nestjs/platform-express'

import { MulterConfigService } from '~/config/multer.config'
import { CongregationsModule } from '~/congregations/congregations.module'

import { AssetsController } from './assets.controller'
import { AssetsService } from './assets.service'
import { S3Manager } from './s3/s3.manager'

@Module({
  imports: [
    CongregationsModule,
    MulterModule.registerAsync({
      imports: [AssetsModule],
      useExisting: MulterConfigService,
    }),
  ],
  controllers: [AssetsController],
  providers: [AssetsService, S3Manager, MulterConfigService],
  exports: [S3Manager, MulterConfigService],
})
export class AssetsModule implements OnApplicationBootstrap {
  constructor(
    protected readonly assetsService: AssetsService,
  ) {}

  async onApplicationBootstrap() {
    await this.assetsService.createTenantsBuckets()
  }
}
