import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { PrismaClientKnownRequestError } from '~/generated/prisma/internal/prismaNamespace'
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
    const id = 1
    jest.spyOn(prisma.territory, 'create')
      .mockImplementationOnce(({ data }) => ({
        id,
        ...data,
      }) as any)

    const result = await service.createTerritory({
      number: '1',
      color: '#000000',
      hidden: false,
      map: null,
    })

    expect(result).toMatchObject({
      id,
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

  it('should be able to update the territory data', async () => {
    const data = {
      number: '1',
      color: '#000',
      hidden: false,
      map: null,
    }
    jest.spyOn(prisma.territory, 'create')
      .mockImplementationOnce(({ data }) => ({
        id: 1,
        ...data,
      }) as any)
    const { id } = await service.createTerritory(data)

    jest.spyOn(prisma.territory, 'update')
      .mockImplementationOnce(({ where, data }) => ({
        id: where.id,
        ...data,
      }) as any)

    const newData = {
      number: '1.1',
      color: '#fff',
      hidden: true,
      map: 'https://maps.google.com/test-map',
    }

    const result = await service.updateTerritory(id, newData)

    expect(result).toMatchObject({
      id,
      ...newData,
    })
  })

  it('should delete territory', async () => {
    jest.spyOn(prisma.territory, 'delete')
      .mockImplementationOnce(({ where }) => ({ ...where } as any))

    const result = await service.deleteTerritory(1)

    expect(prisma.territory.delete).toHaveBeenCalled()

    expect(result).toBe(true)
  })

  it('should fail when trying to delete inexistent territory', async () => {
    jest.spyOn(prisma.territory, 'delete')
      .mockRejectedValueOnce(new PrismaClientKnownRequestError('test', { clientVersion: '', code: '' }))

    const promise = service.deleteTerritory(1)

    expect(prisma.territory.delete).toHaveBeenCalled()

    await expect(promise).rejects.toBeInstanceOf(PrismaClientKnownRequestError)
  })
})
