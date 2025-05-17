import { Test, TestingModule } from '@nestjs/testing'

import { PrismaService } from '~/db/prisma.service'
import { ValidationException } from '~/exceptions/application-exception/validation-exception'
import { House } from '~/generated/prisma'
import { PrismaClientKnownRequestError } from '~/generated/prisma/internal/prismaNamespace'
import { TenantHolderService } from '~/tenants/tenant-holder.service'
import { any, anything } from '~/utils/testing'

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

  // #region territories
  it('should list territories for tenant', async () => {
    jest.spyOn(prisma.territory, 'findMany')
      .mockResolvedValueOnce([
        { id: 1, number: '1', color: '#000000', congregationId: tenantHolder.getTenant()!.id, hidden: false, map: null },
      ] as any)

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

  it('should return territory data', async () => {
    jest.spyOn(prisma.territory, 'findFirst').mockResolvedValueOnce({ id: 1 } as any)

    const result = await service.getTerritory(1)

    expect(prisma.territory.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { congregation: { id: tenantHolder.getTenant().id }, id: 1 },
      include: {
        streets: {
          include: {
            houses: {
              include: {
                updates: anything(),
              },
            },
          },
        },
      },
    }))
    expect(result).toBeTruthy()
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
    const { fields } = exception.issues
    expect(fields).toMatchObject({
      color: [any(String)],
      map: [any(String)],
    })
    expect(fields).not.toHaveProperty('number')
    expect(fields).not.toHaveProperty('hidden')
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
  // #endregion territories

  // #region streets
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

  it('should delete street', async () => {
    const result = await service.deleteStreet(1)

    expect(prisma.street.delete).toHaveBeenCalled()
    expect(result).toBe(true)
  })
  // #endregion streets

  // #region houses
  it('should add a house to a territory/street', async () => {
    const streetId = 1
    const type = 'Casa'
    const number = '102'
    const complement = ''
    const observation = ''
    const phones = ['11 99999-9999']

    jest.spyOn(prisma.house, 'create').mockImplementationOnce(({ data }) => ({
      id: 1,
      ...data,
    }) as any)

    const result = await service.addHouse(streetId, { type, number, complement, observation, phones })

    expect(prisma.house.create).toHaveBeenCalled()
    expect(result).toMatchObject<Partial<House>>({
      id: any(Number),
      streetId,
      type,
      number,
      complement,
      observation,
      phones: phones.map(p => p.replace(/\D/g, '')),
    })
  })

  it('should fail on adding a house with invalid data', async () => {
    const streetId = 1
    const type = 'INVALID'
    const number = 'AAAA'
    const complement = ''
    const observation = ''
    const phones = ['11 99999']
    const promise = service.addHouse(streetId, { type, number, complement, observation, phones })

    expect(promise).rejects.toBeInstanceOf(ValidationException)
    const exception: ValidationException = await promise.catch(err => err)
    const { fields } = exception.issues
    expect(fields).toMatchObject({
      type: [any(String)],
      number: [any(String)],
      phones: [any(String)],
    })
    expect(fields).not.toHaveProperty('complement')
    expect(fields).not.toHaveProperty('observation')
  })

  it('should update a house', async () => {
    const houseId = 1
    const newNumber = '103'

    jest.spyOn(prisma.house, 'update')
      .mockImplementationOnce(({ where, data }) => ({
        ...where,
        ...data,
      }) as any)

    const result = await service.updateHouse(houseId, { number: newNumber })

    expect(prisma.house.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { number: newNumber },
    }))
    expect(result).toMatchObject({
      id: houseId,
      number: newNumber,
    })
  })

  it('should fail updating a house with invalid data', async () => {
    const houseId = 1
    const type = 'INVALID'
    const number = 'AAAA'
    const complement = ''
    const observation = ''
    const phones = ['11 99999']
    const promise = service.updateHouse(houseId, { type, number, complement, observation, phones })

    expect(promise).rejects.toBeInstanceOf(ValidationException)
    const exception: ValidationException = await promise.catch(err => err)
    const { fields } = exception.issues
    expect(fields).toMatchObject({
      type: [any(String)],
      number: [any(String)],
      phones: [any(String)],
    })
    expect(fields).not.toHaveProperty('complement')
    expect(fields).not.toHaveProperty('observation')
  })

  it('should be able to delete a house', async () => {
    const houseId = 1

    const result = await service.deleteHouse(houseId)

    expect(result).toBe(true)
  })
  // #endregion houses
})
