import { ForbiddenException, Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { detectCrawler } from '@repo/utils/crawler'
import { Strategy } from 'passport-custom'

import { AuthService } from '../auth.service'

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super()
  }

  async validate(req: Application.Request) {
    // bypass token validation for meta crawlers
    if (detectCrawler(req.header('user-agent') ?? ''))
      return await this.authService.getFakeCrawlerUser(req)

    const { refresh_token: refreshToken } = req.body

    const user = await this.authService.validateUserByRefreshToken(refreshToken)

    if (!user)
      throw new ForbiddenException()

    return user
  }
}
