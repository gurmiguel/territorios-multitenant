import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { Strategy } from 'passport-google-oauth2'

import { Configuration } from '~/config/configuration'

import { AuthService } from '../auth.service'

interface ProfileData {
  provider: 'google'
  id: string
  displayName: string
  emails: string[]
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Configuration, true>,
  ) {
    const origin = config.get('origin')
    const authConfig = config.get('auth', { infer: true })
    super({
      clientID: authConfig.google.clientId!,
      clientSecret: authConfig.google.clientSecret!,
      callbackURL: `${origin}/auth/google/callback`,
      passReqToCallback: true,
      scope: ['email', 'profile'],
    })
  }

  async validate(req: Request, _accessToken: string, _refreshToken: string, profile: ProfileData) {
    const user = await this.authService.validateUserByProvider(req.id, profile.provider, profile.id, {
      name: profile.displayName,
      email: profile.emails[0]!,
    })

    return user
  }
}
