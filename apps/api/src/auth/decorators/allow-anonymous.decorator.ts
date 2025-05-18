import { SetMetadata } from '@nestjs/common'

export const ALLOW_ANONYMOUS_KEY = Symbol.for('allow-anonymous')
export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true)
