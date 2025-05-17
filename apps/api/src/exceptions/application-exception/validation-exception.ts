import { IntrinsicException } from '@nestjs/common'
import { ZodError } from 'zod'

export class ValidationException extends IntrinsicException {
  constructor(protected readonly zodValidations: ZodError) {
    super(zodValidations.name)
    this.name = 'ValidationException'
  }

  get issues() {
    const { fieldErrors, formErrors } = this.zodValidations.flatten()

    if (formErrors.length > 0)
      fieldErrors['$'] = formErrors

    return { fields: fieldErrors }
  }
}
