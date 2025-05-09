import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { TenantHolderService } from '~/tenants/tenant-holder.service'
import { any } from '~/utils/testing'

import { TerritoriesService } from './territories.service'

describe('TerritoriesService', () => {
  let service: TerritoriesService
  let prisma: PrismaService
  let tenantHolder: TenantHolderService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantHolderService,
        TerritoriesService,
        PrismaService,
      ],
    }).compile()

    service = module.get<TerritoriesService>(TerritoriesService)
    prisma = module.get<PrismaService>(PrismaService)
    tenantHolder = await module.resolve<TenantHolderService>(TenantHolderService)
  })

  it('should list territories for tenant', async () => {
    jest.spyOn(prisma.territory, 'findMany')
      .mockResolvedValueOnce([
        { id: 1, number: '1', color: '#000000', congregationId: tenantHolder.getTenant()!.id, hidden: false, map: null },
      ])

    const result = await service.getTerritories()

    expect(result).toHaveLength(1)
    expect(result).toMatchObject([{
      id: any(Number),
      number: any(String),
      color: any(String),
      congregationId: any(Number),
      hidden: any(Boolean),
    }])
  })

  it('should create a territory for tenant', async () => {
    jest.spyOn(prisma.territory, 'create')
      .mockImplementationOnce(({ data }) => ({
        id: 1,
        ...data,
      }) as unknown as ReturnType<typeof prisma.territory.create>)

    const result = await service.createTerritory({
      number: '1',
      color: '#000000',
      hidden: false,
      map: null,
    })

    expect(result).toMatchObject({
      id: any(Number),
      number: any(String),
      color: any(String),
    })
  })

  it('should fail if territory payload is invalid', async () => {
    const data = {
      number: '1',
      color: 'blue', // must be hexadecimal
      hidden: false,
      map: 'not a url', // must be a url
    }
    const promise = service.createTerritory(data)

    await expect(promise).rejects.toBeInstanceOf(ValidationException)
    const exception: ValidationException = await promise.catch(err => err)
    const { fieldErrors } = exception.zodValidations.flatten()
    expect(fieldErrors).toMatchObject({
      color: [any(String)],
      map: [any(String)],
    })
    expect(fieldErrors).not.toHaveProperty('number')
    expect(fieldErrors).not.toHaveProperty('hidden')
  })
})
