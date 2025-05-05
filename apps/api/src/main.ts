import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'

import { AppModule } from './app.module'
import { Configuration } from './config/configuration'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: true }),
    { abortOnError: false },
  )

  const config = app.get<ConfigService<Configuration, true>>(ConfigService)

  await app.listen({
    port: config.get('port', { infer: true }),
    host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : undefined,
  })
}
bootstrap()

declare module 'express' {
  interface Request {
    id: string
  }
}
