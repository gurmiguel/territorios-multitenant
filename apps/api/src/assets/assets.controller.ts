import { Controller, Param, ParseFilePipeBuilder, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { Allow } from '~/auth/decorators/allow.decorator'
import { Action } from '~/auth/permissions/action.enum'
import { Area } from '~/auth/permissions/area.enum'
import { PermissionMode } from '~/auth/permissions/permission-mode.enum'

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
