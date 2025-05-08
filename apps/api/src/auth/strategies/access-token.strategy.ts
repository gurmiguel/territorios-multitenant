import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'

import { AuthService } from '../auth.service'

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'access_token') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super()
  }

  async validate(req: Application.Request) {
    const accessToken = this.getBearerToken(req)
    const user = await this.authService.validateUserByAccessToken(req.id, accessToken)

    if (!user)
      throw new UnauthorizedException()

    return user
  }

  private getBearerToken(req: Application.Request) {
    const [ type, token ] = req.headers.authorization?.split(' ') ?? []

    switch (type) {
      case 'Bearer':
        if (token)
          return token
    }

    throw new ForbiddenException('Invalid authorization token')
  }
}
