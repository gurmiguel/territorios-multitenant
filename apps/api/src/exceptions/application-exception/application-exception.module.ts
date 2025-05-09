import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'

import { DataValidationExceptionFilter } from './data-validation-exception.filter'
import { ValidationExceptionFilter } from './validation-exception.filter'

@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DataValidationExceptionFilter,
    },
  ],
})
export class ApplicationExceptionModule {}
