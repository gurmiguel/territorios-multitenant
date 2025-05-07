import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { TenantHolderService } from '~/tenants/tenant-holder.service'
import { UsersService } from '~/users/users.service'

import { AuthService } from './auth.service'
import authConstants from './constants'

describe('AuthService', () => {
  let service: AuthService
  let usersService: UsersService
  let tenantHolderService: TenantHolderService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantHolderService,
        JwtService,
        AuthService,
        {
          provide: UsersService,
          useClass: class {
            find = jest.fn()
          },
        },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
    tenantHolderService = module.get<TenantHolderService>(TenantHolderService)

    jest.spyOn(tenantHolderService, 'getTenant')
      .mockImplementation(() => ({ id: 1, name: 'Test', createdAt: new Date(), slug: 'test' }))
  })

  it('should be able to login with username (email)', async () => {
    const username = 'test@email.com'

    const user = { id: '123456', email: username } as unknown as Express.User
    jest.spyOn(usersService, 'find')
      // @ts-expect-error
      .mockImplementationOnce(async () => user)

    const result = await service.validateUserLocal('req-1', username, authConstants.defaultPassword)

    expect(result).toMatchObject(user)
  })
})
