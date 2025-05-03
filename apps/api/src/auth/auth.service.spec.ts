import { Test, TestingModule } from '@nestjs/testing'

import { UsersService } from '~/users/users.service'

import { AuthService } from './auth.service'
import authConstants from './constants'

describe('AuthService', () => {
  let service: AuthService
  let usersService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
  })

  it('should be able to login with username (email)', async () => {
    const username = 'test@email.com'

    const user = { id: '123456', email: username }
    jest.spyOn(usersService, 'find').mockImplementationOnce(async () => user as any)

    const result = await service.validateUser(username, authConstants.defaultPassword)

    expect(result).toEqual(user)
  })
})
