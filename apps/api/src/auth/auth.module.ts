import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'

import { Configuration } from '~/config/configuration'
import { Congregation, User as PrismaUser } from '~/generated/prisma'
import { UsersModule } from '~/users/users.module'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
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
  providers: [AuthService, LocalStrategy, RefreshTokenStrategy],
  controllers: [AuthController],
})
export class AuthModule {}

declare global {
  namespace Express {
    interface User extends PrismaUser {
      congregation: Congregation
      /** @summary refresh user data against storage */
      refresh(): Promise<User>
    }
  }
}
