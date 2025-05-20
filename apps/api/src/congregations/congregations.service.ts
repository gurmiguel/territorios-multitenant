import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'

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
}
