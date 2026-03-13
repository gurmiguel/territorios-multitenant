import { applyDecorators, SetMetadata } from '@nestjs/common'

export const SAFE_AUTH_ROUTE = Symbol.for('safe-auth')

export function SafeAuth() {
  return applyDecorators(
    SetMetadata(SAFE_AUTH_ROUTE, true),
  )
}
