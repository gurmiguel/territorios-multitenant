import { SetMetadata } from '@nestjs/common'

export const ALLOW_ANONYMOUS_KEY = 'allow-anonymous'

export const AllowAnonymous = () => SetMetadata(ALLOW_ANONYMOUS_KEY, true)
