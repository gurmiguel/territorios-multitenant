import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'
import { Prisma } from '~/generated/prisma'

@Injectable()
export class UsersService {
  constructor(
    protected readonly prisma: PrismaService,
  ) {}

  get find() {
    return this.prisma.user.findFirst
  }

  get findMany() {
    return this.prisma.user.findMany
  }

  get create() {
    return this.prisma.user.create
  }

  get updateMany() {
    return this.prisma.user.updateMany
  }

  async addProvider(data: Prisma.AccountProviderCreateArgs['data']) {
    await this.prisma.accountProvider.create({ data })
  }

  get countUsers() {
    return this.prisma.user.count
  }
}
