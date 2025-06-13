import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'
import { AssetType } from '~/generated/prisma/enums'

@Injectable()
export class CongregationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  get find() {
    return this.prisma.congregation.findFirst
  }

  get findMany() {
    return this.prisma.congregation.findMany
  }

  getMap(id: number) {
    return this.prisma.asset.findFirst({
      where: {
        congregationId: id,
        type: AssetType.MAP,
      },
    })
  }
}
