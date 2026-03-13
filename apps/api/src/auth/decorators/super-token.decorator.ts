import { applyDecorators, SetMetadata } from '@nestjs/common'

export const SUPER_TOKEN_KEY = Symbol.for('super-token')

export function SuperTokenAuth() {
  return applyDecorators(
    SetMetadata(SUPER_TOKEN_KEY, true),
  )
}
