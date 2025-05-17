import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

import { ValidationException } from './validation-exception'

@Catch(ValidationException)
export class ValidationExceptionFilter extends BaseExceptionFilter {
  catch(exception: ValidationException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Application.Response>()

    response
      .status(HttpStatus.BAD_REQUEST)
      .json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
        issues: exception.issues,
      })
  }
}
