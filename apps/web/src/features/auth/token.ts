import { decodeJwt } from 'jose'

export const tryDecodeJwt = (token: string | undefined) => {
  try {
    if (!token) return null

    return decodeJwt(token)
  } catch {
    return null
  }
}
