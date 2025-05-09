import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'

import { PrismaClientKnownRequestError } from '~/generated/prisma/internal/prismaNamespace'

@Catch(PrismaClientKnownRequestError)
export class DataValidationExceptionFilter extends BaseExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Application.Response>()

    const errorMap: Record<string, string> = {
      P1008: 'Operation timed out',
      P2000: 'Value is too long',
      P2001: 'Invalid query',
      P2002: 'Unique constraint failed',
      P2004: 'Constraint failed',
      P2005: 'Invalid data',
      P2006: 'Invalid data',
      P2007: 'Invalid data',
      P2011: 'Missing value',
      P2012: 'Missing value',
      P2019: 'Missing value',
    }

    if (false === exception.code in errorMap)
      Logger.error('Unhandled Prisma exception', exception, exception.code)

    response
      .status(HttpStatus.BAD_REQUEST)
      .json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: errorMap[exception.code] || `Invalid operation: ${exception.code}`,
        meta: exception.meta,
      })
  }
}
