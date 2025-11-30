import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'

import { AuthService } from '../auth.service'

@Injectable()
export class SuperTokenStrategy extends PassportStrategy(Strategy, 'super') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super()
  }

  async validate(req: Application.Request) {
    const superToken = this.getBearerToken(req)

    const user = await this.authService.validateSuperToken(superToken)

    if (!user)
      throw new UnauthorizedException()

    const { secret: _, ...userData } = user

    return userData
  }

  private getBearerToken(req: Application.Request) {
    const [ type, ...rest ] = req.headers.authorization?.split(' ') ?? []
    const token = rest.join(' ')

    switch (type) {
      case 'Bearer':
        if (token)
          return token
    }

    throw new ForbiddenException('Invalid authorization token')
  }
}
