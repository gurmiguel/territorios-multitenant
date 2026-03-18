import { decodeJwt } from 'jose'

import { User } from './types'

export const tryDecodeJwt = <T = User>(token: string | undefined) => {
  try {
    if (!token) return null

    return decodeJwt<T>(token)
  } catch {
    return null
  }
}
