import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'

import { CongregationsService } from '~/congregations/congregations.service'
import { PrismaService } from '~/db/prisma.service'
import { Asset, AssetType, User } from '~/generated/prisma'
import { TenantHolderService } from '~/tenants/tenant-holder.service'

import { S3Manager } from './s3/s3.manager'

@Injectable()
export class AssetsService {
  protected readonly logger = new Logger(AssetsService.name)

  constructor(
    protected readonly congregationsService: CongregationsService,
    protected readonly s3Manager: S3Manager,
    protected readonly prisma: PrismaService,
    protected readonly tenantHolder: TenantHolderService,
  ) {
  }

  protected get s3() {
    return this.s3Manager.getS3()
  }

  async updateMap(userId: User['id'], file: Express.MulterS3.File) {
    const existingAsset = await this.prisma.asset.findFirst({
      where: { congregation: { id: this.tenantHolder.getTenant().id }, type: AssetType.MAP },
    })

    const publicUrl = this.s3Manager.getPublicUrl(file.key)

    let asset: Asset
    if (existingAsset) {
      asset = await this.prisma.asset.update({
        where: { id: existingAsset.id },
        data: {
          contentType: file.contentType,
          s3path: file.key,
          publicUrl,
          metadata: file.metadata,
        },
      })
      await this.s3.send(new DeleteObjectCommand({
        Bucket: this.s3Manager.getBucket(),
        Key: existingAsset.s3path,
      })).catch((ex: Error) => {
        this.logger.error('Could not delete existing map object: ' + ex.message)
        return null
      })
    } else {
      asset = await this.prisma.asset.create({
        data: {
          type: AssetType.MAP,
          contentType: file.contentType,
          s3path: file.key,
          publicUrl,
          congregationId: this.tenantHolder.getTenant().id,
          uploaderId: userId,
          metadata: file.metadata,
        },
      })
    }

    return asset
  }
}
