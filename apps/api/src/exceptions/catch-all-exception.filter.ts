import { ArgumentsHost, Catch, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class CatchAllExceptionsFilter extends BaseExceptionFilter {
  protected readonly logger = new Logger(CatchAllExceptionsFilter.name)

  constructor(
    protected readonly config: ConfigService,
  ) {
    super()
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (this.config.get<boolean>('DEBUG') === true)
      this.logger.debug(exception)
    super.catch(exception, host)
  }
}
