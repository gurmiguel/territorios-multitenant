import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { ExpressAdapter, NestExpressApplication } from '@nestjs/platform-express'
import e from 'express'
import session from 'express-session'

import { AppModule } from './app.module'
import { Configuration } from './config/configuration'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
    { abortOnError: false },
  )

  const config = app.get<ConfigService<Configuration, true>>(ConfigService)

  app.enableCors()
  app.use(session({
    secret: config.get('auth', { infer: true }).secret,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 60_000,
    },
  }))

  await app.listen(config.get('port', { infer: true }), '0.0.0.0')
}
bootstrap()

declare global {
  namespace Application {
    interface Request extends e.Request {
      id: string
    }
    interface Response extends e.Response {}
  }
}
