import { Controller, Param, ParseFilePipeBuilder, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { Allow } from '~/auth/decorators/allow.decorator'
import { Action } from '@repo/utils/permissions/index'
import { Area } from '@repo/utils/permissions/index'
import { PermissionMode } from '@repo/utils/permissions/index'

import { AssetsService } from './assets.service'

const FileUploadValidator = new ParseFilePipeBuilder()
  .addFileTypeValidator({
    fileType: /image.(jpeg|gif|png|webp)/,
    skipMagicNumbersValidation: true,
  })
  .build()

@Controller('assets')
export class AssetsController {
  constructor(
    protected readonly assetsService: AssetsService,
  ) {}

  @Allow([Area.ASSETS, Action.WRITE])
  @Post('map')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMap(
    @UploadedFile(FileUploadValidator) file: Express.MulterS3.File,
    @Request() req: Application.Request,
  ) {
    const asset = await this.assetsService.updateMap(req.user!.id, file)

    return asset.publicUrl
  }

  @Allow(PermissionMode.ALL, [Area.ASSETS, Action.WRITE], [Area.TERRITORIES, Action.WRITE])
  @Post('territory/:territoryId')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTerritoryImage(
    @Param('territoryId') territoryId: string,
    @UploadedFile(FileUploadValidator) file: Express.MulterS3.File,
    @Request() req: Application.Request,
  ) {
    const user = req.user!

    const asset = await this.assetsService.updateTerritoryImage(user.id, parseInt(territoryId), file)

    return asset.publicUrl
  }
}
