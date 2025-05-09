import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'

import { Configuration } from '~/config/configuration'

import { AuthService } from '../auth.service'

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
      pkce: true,
      state: true,
    })
  }

  async validate(req: Application.Request, accessToken: string, refreshToken: string, profile: Profile) {
    const sessionKey = (this as any)._key
    const session = req.session[sessionKey]
    const user = await this.authService.validateUserByProvider(session.tenant, profile.provider, profile.id, {
      name: profile.displayName,
      email: profile.emails![0]!.value,
    })

    return user
  }
}
