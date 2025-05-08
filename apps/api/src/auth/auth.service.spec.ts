import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'

import { TenantHolderService } from '~/tenants/tenant-holder.service'
import { UsersService } from '~/users/users.service'

import { AuthService } from './auth.service'
import authConstants from './constants'

jest.mock('../users/users.service', () => ({
  UsersService: class {
    protected prisma = jest.fn()
    find = jest.fn()
    create = jest.fn()
    addProvider = jest.fn()
  },
}))

describe('AuthService', () => {
  let service: AuthService
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantHolderService,
        JwtService,
        AuthService,
        UsersService,
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
  })

  it('should be able to login with username (email)', async () => {
    const username = 'test@email.com'

    const user = { id: '123456', email: username } as unknown as Express.User
    jest.spyOn(usersService, 'find')
      // @ts-expect-error
      .mockImplementationOnce(async () => user)

    const result = await service.validateUserLocal('req-test', username, authConstants.defaultPassword)

    expect(result).toMatchObject(user)
  })
})
