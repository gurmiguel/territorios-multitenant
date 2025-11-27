import { DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Injectable, Logger } from '@nestjs/common'

import { CongregationsService } from '~/congregations/congregations.service'
import { PrismaService } from '~/db/prisma.service'
import { Asset, AssetType, User } from '~/generated/prisma/client'
import { AssetUpdateArgs } from '~/generated/prisma/models'
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
    return await this.upsertAsset(file, userId, AssetType.MAP)
  }

  async updateTerritoryImage(userId: string, territoryId: number, file: Express.MulterS3.File) {
    return await this.upsertAsset(file, userId, AssetType.TERRITORY, territoryId)
  }

  private async upsertAsset(file: Express.MulterS3.File, userId: string, type: 'MAP'): Promise<Asset>
  private async upsertAsset(file: Express.MulterS3.File, userId: string, type: 'TERRITORY', territoryId: number): Promise<Asset>
  private async upsertAsset(file: Express.MulterS3.File, userId: string, type: AssetType, territoryId?: number) {
    const existingAsset = await this.prisma.asset.findFirst({
      where: {
        congregation: { id: this.tenantHolder.getTenant().id },
        type,
        // only populated for type == AssetType.Territory
        territory: { id: territoryId },
      },
    })

    const publicUrl = this.s3Manager.getPublicUrl(file.key)

    let asset: Asset
    const assetData = {
      contentType: file.contentType,
      s3path: file.key,
      publicUrl,
      metadata: file.metadata,
    } satisfies AssetUpdateArgs['data']

    if (existingAsset) {
      asset = await this.prisma.asset.update({
        where: { id: existingAsset.id },
        data: assetData,
      })
      await this.s3.send(new DeleteObjectCommand({
        Bucket: this.s3Manager.getBucket(),
        Key: existingAsset.s3path,
      })).catch((ex: Error) => {
        this.logger.error(`Could not delete existing ${type.toLowerCase()} object: ` + ex.message)
      })
    } else {
      asset = await this.prisma.asset.create({
        data: {
          type,
          ...assetData,
          congregationId: this.tenantHolder.getTenant().id,
          territory: territoryId ? {
            connect: { id: territoryId },
          } : undefined,
          uploaderId: userId,
        },
      })
    }
    return asset
  }
}
