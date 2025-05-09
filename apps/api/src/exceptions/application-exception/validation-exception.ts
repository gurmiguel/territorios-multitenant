import { IntrinsicException } from '@nestjs/common'
import { ZodError } from 'zod'

export class ValidationException extends IntrinsicException {
  constructor(public readonly zodValidations: ZodError) {
    super()
    this.name = 'ValidationException'
  }
}
