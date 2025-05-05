import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'
import { Prisma } from '~/generated/prisma'

@Injectable()
export class CongregationsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async find(criteria: Prisma.CongregationWhereInput) {
    return await this.prisma.congregation.findFirst({
      where: criteria,
    })
  }
}
