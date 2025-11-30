import { BadRequestException, Injectable } from '@nestjs/common'
import { z } from 'zod'

import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { Congregation } from '~/generated/prisma/client'
import { AssetType } from '~/generated/prisma/enums'

@Injectable()
export class CongregationsService {
  private readonly schema = z.object({
    name: z.string(),
    domains: z.array(z.string()).nonempty({ error: 'Define at least one domain for the tenant' }),
  } satisfies Record<keyof Omit<Congregation, 'id' | 'publicId' | 'createdAt'>, unknown>)

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  get find() {
    return this.prisma.congregation.findFirst
  }

  get findMany() {
    return this.prisma.congregation.findMany
  }

  async create(data: z.infer<typeof this.schema>) {
    const { error, data: parsed } = await this.schema.safeParseAsync(data)

    if (error) throw new ValidationException(error)

    const matchingDomains = await this.prisma.congregation.count({
      where: { OR: [
        { domains: { hasSome: parsed.domains } },
        { name: parsed.name },
      ] },
    })

    if (matchingDomains) throw new BadRequestException('Congregation with the same domains or name already exists')

    const congregation = await this.prisma.congregation.create({ data: parsed })

    return congregation
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
