import { CreateBucketCommand, ListBucketsCommand } from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'

import { CongregationsService } from '~/congregations/congregations.service'

import { S3Manager } from './s3/s3.manager'

@Injectable()
export class AssetsService {
  protected readonly logger = new Logger(AssetsService.name)

  constructor(
    protected readonly congregationsService: CongregationsService,
    protected readonly s3Manager: S3Manager,
  ) {
  }

  protected get s3() {
    return this.s3Manager.getS3()
  }

  async createTenantsBuckets() {
    const tenants = await this.congregationsService.findMany()

    const existingBuckets = await this.s3.send(new ListBucketsCommand())

    const missingBucketTenants = tenants.filter(t => !existingBuckets.Buckets?.some(b => b.Name === t.slug))

    for (const tenant of missingBucketTenants) {
      this.logger.log(`Creating R2 bucket for congregation: ${tenant.name} [bucket=${tenant.slug}]`)
      await this.s3.send(new CreateBucketCommand({
        Bucket: tenant.slug,
        ACL: 'public-read',
      }))
    }

    this.logger.log(`Created R2 buckets for ${missingBucketTenants.length} congregations`)
  }
}
