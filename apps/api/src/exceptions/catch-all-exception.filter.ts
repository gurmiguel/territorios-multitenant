import { ArgumentsHost, Catch, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

@Catch()
export class CatchAllExceptionsFilter extends BaseExceptionFilter {
  protected readonly logger = new Logger(CatchAllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    this.logger.debug(exception)
    super.catch(exception, host)
  }
}
