import { randomUUID } from 'node:crypto'

import { Injectable, Scope } from '@nestjs/common'
import { MulterModuleOptions, MulterOptionsFactory } from '@nestjs/platform-express'
import multerS3 from 'multer-s3'
import parseDuration from 'parse-duration'

import { S3Manager } from '~/assets/s3/s3.manager'
import { TenantHolderService } from '~/tenants/tenant-holder.service'

@Injectable({ scope: Scope.REQUEST })
export class MulterConfigService implements MulterOptionsFactory {
  constructor(
    protected readonly tenantHolder: TenantHolderService,
    protected readonly s3Manager: S3Manager,
  ) {
  }

  createMulterOptions(): MulterModuleOptions {
    return {
      storage: multerS3({
        s3: this.s3Manager.getS3(),
        bucket: this.s3Manager.getBucket(),
        metadata(req, file, cb) {
          cb(null, { originalName: file.originalname })
        },
        key: (req, file, cb) => {
          const extension = file.originalname.split('.').pop()?.trim()

          if (!extension)
            return cb(new TypeError(`File ${file.originalname} must have a valid extension`))

          cb(null, `${this.tenantHolder.getTenant().publicId}/${randomUUID()}.${extension}`)
        },
        acl: 'public-read',
        cacheControl: `max-age=${Math.floor(parseDuration('1 month')! / 1000)}`,
        contentType: multerS3.AUTO_CONTENT_TYPE,
      }),
    }
  }
}
