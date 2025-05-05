import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'
import { Prisma } from '~/generated/prisma'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  get find() {
    return this.prisma.user.findFirst
  }

  get create() {
    return this.prisma.user.create
  }

  async addProvider(data: Prisma.AccountProviderCreateArgs['data']) {
    await this.prisma.accountProvider.create({ data })
  }
}
