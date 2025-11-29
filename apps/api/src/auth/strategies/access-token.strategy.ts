import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { detectCrawler } from '@repo/utils/crawler'
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
    // bypass token validation for meta crawlers
    if (detectCrawler(req.header('user-agent') ?? ''))
      return await this.authService.getFakeCrawlerUser(req)

    const accessToken = await this.getBearerToken(req)
    const user = await this.authService.validateUserByAccessToken(accessToken)

    if (!user)
      throw new UnauthorizedException()

    return user
  }

  private async getBearerToken(req: Application.Request) {
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
