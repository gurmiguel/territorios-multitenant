import { delay } from '@repo/utils/delay'
import { cookies } from 'next/headers'
import parseDuration from 'parse-duration'

import { ApiClientBase } from './api.base'
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../auth/constants'

export class ServerApiClient extends ApiClientBase {
  private static instance: ServerApiClient

  private constructor(protected readonly baseUrl: string) {
    super()
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ServerApiClient {
    if (!ServerApiClient.instance) {
      ServerApiClient.instance = new ServerApiClient(process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, ''))
    }
    return ServerApiClient.instance
  }

  public async authenticate(accessToken: string, refreshToken?: string) {
    await delay(100)

    this.setAuthCookies(refreshToken, accessToken)
  }

  protected async getAuthCookies() {
    const cookieStore = await cookies()

    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value
    const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value

    return { accessToken, refreshToken }
  }

  protected async setAuthCookies(refreshToken?: string, accessToken?: string) {
    const cookieStore = await cookies()

    try {
      if (accessToken)
        cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          maxAge: parseDuration('1 hour')!,
        })

      if (refreshToken)
        cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, this.refreshTokenCookieSharedOptions)
      else
        cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)
    } catch {
      // ignore not being able to set cookies in RSC
    }
  }

  protected async clearAuthCookies() {
    const cookieStore = await cookies()

    cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)
  }
}
