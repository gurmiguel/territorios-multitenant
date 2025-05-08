import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { Configuration } from '~/config/configuration'
import { UsersModule } from '~/users/users.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessTokenAuthGuard } from './guards/access-token.guard'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { LocalStrategy } from './strategies/local.strategy'
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy'

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<Configuration, true>) => ({
        secret: configService.get('auth', { infer: true }).secret,
        signOptions: { expiresIn: '60m' },
      }),
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    GoogleStrategy,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: AccessTokenAuthGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}

type BuildUserReturn = ReturnType<InstanceType<typeof AuthService>['buildUser']>

declare global {
  namespace Express {
    interface User extends BuildUserReturn {}
  }
}
