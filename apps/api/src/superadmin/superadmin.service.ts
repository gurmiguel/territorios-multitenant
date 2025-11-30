import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'

@Injectable()
export class SuperadminService {
  constructor(
    protected readonly prisma: PrismaService,
  ) {}

  get find() {
    return this.prisma.superAdmin.findFirst
  }

  get update() {
    return this.prisma.superAdmin.update
  }
}
