import { Controller, ParseFilePipeBuilder, Post, Request, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'

import { Allow } from '~/auth/decorators/allow.decorator'
import { Action } from '~/auth/permissions/action.enum'
import { Area } from '~/auth/permissions/area.enum'

import { AssetsService } from './assets.service'

@Controller('assets')
export class AssetsController {
  constructor(
    protected readonly assetsService: AssetsService,
  ) {}

  @Allow([Area.ASSETS, Action.WRITE])
  @Post('map')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMap(
    @UploadedFile(new ParseFilePipeBuilder()
      .addFileTypeValidator({ fileType: /image.(jpeg|gif|png|webp)/, skipMagicNumbersValidation: true })
      .build(),
    ) file: Express.MulterS3.File,
    @Request() req: Application.Request,
  ) {
    const asset = await this.assetsService.updateMap(req.user!.id, file)

    return asset.publicUrl
  }
}
