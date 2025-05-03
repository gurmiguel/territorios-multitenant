import { Injectable } from '@nestjs/common'

import { PrismaService } from '~/db/prisma.service'
import { Prisma } from '~/generated/prisma'

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async find(criteria: Prisma.UserWhereInput) {
    return this.prisma.user.findFirst({ where: criteria })
  }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data })
  }
}
