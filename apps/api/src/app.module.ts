import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from './auth/auth.module'
import configuration from './config/configuration'
import { CongregationsModule } from './congregations/congregations.module'
import { PrismaModule } from './db/prisma.module'
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
    AuthModule,
    UsersModule,
    PrismaModule,
    CongregationsModule,
    TenantsModule,
    TerritoriesModule,
  ],
})
export class AppModule {}
