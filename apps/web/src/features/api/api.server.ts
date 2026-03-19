import { cookies } from 'next/headers'
import parseDuration from 'parse-duration'

import { ApiClientBase, ApiError } from './api.base'
import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '../auth/constants'
import { requestContext } from '../di/context'

const SERVER_API_CLIENT_DI = 'SERVER_API_CLIENT_DI'
export class ServerApiClient extends ApiClientBase {
  private constructor(protected readonly baseUrl: string) {
    super()
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ServerApiClient {
    const store = requestContext.getStore()
    if (!store)
      console.log('Request context store is not available, method called outside of a function wrapped in `withRequestScope`')
    let instance: ServerApiClient = store?.get(SERVER_API_CLIENT_DI)
    if (!instance) {
      instance = new ServerApiClient(process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, ''))
      requestContext.getStore()?.set(SERVER_API_CLIENT_DI, instance)
    }
    return instance
  }

  public async authenticate(accessToken: string, refreshToken?: string) {
    return this.setAuthCookies(refreshToken, accessToken)
  }

  public async getAuthCookies() {
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
      else if (cookieStore.has(REFRESH_TOKEN_COOKIE_NAME))
        cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)
    } catch (e) {
      // ignore not being able to set cookies in RSC
      if ((e as Error).message.startsWith('Cookies can only be modified in a Server Action or Route Handler')) return

      console.error('Error setting cookies:', e)
    }
  }

  protected async clearAuthCookies() {
    const cookieStore = await cookies()

    cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
    cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)
  }

  public async refreshTokens() {
    this.refreshToken ??= (await this.getAuthCookies()).refreshToken

    const url = '/auth/refresh'

    const response = await fetch(this.buildUrl(url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    }).catch(error => {
      return Response.json({
        error,
        access_token: 'offline',
        refresh_token: this.refreshToken,
      }, { status: 499, statusText: 'Client Closed Request' })
    })

    if (!response.ok && response.status !== 499) {
      throw new ApiError(response.status, response.statusText, {url, response: await response.text()})
    }

    const { access_token, refresh_token } = await response.json()

    this.accessToken = access_token
    this.refreshToken = refresh_token

    await this.authenticate(access_token, refresh_token)

    return { accessToken: this.accessToken, refreshToken: this.refreshToken! }
  }
}
