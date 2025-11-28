import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'

import { AssetsModule } from './assets/assets.module'
import { AuthModule } from './auth/auth.module'
import configuration from './config/configuration'
import { CongregationsModule } from './congregations/congregations.module'
import { PrismaModule } from './db/prisma.module'
import { ApplicationExceptionModule } from './exceptions/application-exception/application-exception.module'
import { CatchAllExceptionsFilter } from './exceptions/catch-all-exception.filter'
import { RequestLoggingInterceptor } from './logging/request-logging.interceptor'
import { TenantsModule } from './tenants/tenants.module'
import { TerritoriesModule } from './territories/territories.module'
import { UsersModule } from './users/users.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: [configuration],
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    AuthModule,
    UsersModule,
    PrismaModule,
    CongregationsModule,
    TenantsModule,
    TerritoriesModule,
    ApplicationExceptionModule,
    AssetsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: CatchAllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor,
    },
  ],
})
export class AppModule {}
