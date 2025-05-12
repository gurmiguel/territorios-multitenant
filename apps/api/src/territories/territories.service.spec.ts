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

  const invalidTerritoryData = {
    number: '1',
    color: 'blue', // must be hexadecimal
    hidden: false,
    map: 'not a url', // must be a url
  }

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
    const promise = service.createTerritory(invalidTerritoryData)

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

  it('should be able to update the territory and fail if invalid data', async () => {
    const id = 1
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

    const promise = service.updateTerritory(id, invalidTerritoryData)

    await expect(promise).rejects.toBeInstanceOf(ValidationException)
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

  it('should add a street to a territory', async () => {
    const id = 1
    jest.spyOn(prisma.street, 'create')
      .mockImplementationOnce(({ data }) => ({
        id,
        ...data,
      }) as any)

    const result = await service.addStreet(1, { name: 'Test Street' })

    expect(result).toMatchObject({
      id: any(Number),
      name: any(String),
    })
  })

  it('should fail on creating street with invalid data', async () => {
    const id = 1
    jest.spyOn(prisma.street, 'create')
      .mockImplementationOnce(({ data }) => ({
        id,
        ...data,
      }) as any)

    const promise = service.addStreet(1, { name: null } as any)

    await expect(promise).rejects.toBeInstanceOf(ValidationException)
  })

  it('should update street and fail if invalid data', async () => {
    const id = 1
    jest.spyOn(prisma.street, 'update')
      .mockImplementationOnce(({ where, data }) => ({
        ...where,
        ...data,
      }) as any)

    await service.addStreet(1, { name: 'Test Street' })

    const result = await service.updateStreet(1, id, { name: 'Other Test Street' })

    expect(result).toMatchObject({
      id,
      name: any(String),
    })

    const promise = service.updateStreet(1, id, { name: null } as any)

    await expect(promise).rejects.toBeInstanceOf(ValidationException)
  })
})
