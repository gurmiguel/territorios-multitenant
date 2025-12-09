import { Controller, Get } from '@nestjs/common'

import { AssetsService } from './assets/assets.service'
import { AllowAnonymous } from './auth/decorators/allow-anonymous.decorator'
import { PrismaService } from './db/prisma.service'

@Controller()
export class AppController {
  constructor(
    protected readonly prismaService: PrismaService,
    protected readonly assetsService: AssetsService,
  ) {}

  @Get('healthcheck')
  @AllowAnonymous()
  public async healthCheck() {
    const [
      [dbStatus],
      assets,
    ] = await Promise.all([
      this.getDbStatus(),
      this.getAssetsStatus(),
    ])

    return {
      db: dbStatus.res === 1,
      assets,
    }
  }

  private getDbStatus = () => this.prismaService.$queryRaw<[{res: number}]>`SELECT 1 as res`

  private getAssetsStatus = () => this.assetsService.getHealthCheck()
}
