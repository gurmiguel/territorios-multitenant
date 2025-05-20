import { S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { Configuration } from '~/config/configuration'

@Injectable()
export class S3Manager {
  protected readonly s3: S3Client
  protected readonly bucket: string
  protected readonly publicUrl: string

  constructor(
    config: ConfigService<Configuration, true>,
  ) {
    const s3Config = config.get('s3', { infer: true })
    this.s3 = new S3Client({
      endpoint: `https://${s3Config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: s3Config.accessKeyId,
        secretAccessKey: s3Config.accessKeySecret,
        accountId: s3Config.accountId,
      },
      region: s3Config.region,
    })
    this.bucket = s3Config.bucket
    this.publicUrl = s3Config.publicUrl.replace(/\/+$/, '')
  }

  getS3 = () => this.s3

  getBucket() {
    return this.bucket
  }
  getPublicUrl(objectKey: string) {
    return `${this.publicUrl}/${objectKey}`
  }
}
