'use client'

import { Deferred } from '@repo/utils/deferred'
import { decodeJwt } from 'jose'
import Cookies from 'js-cookie'

import { ApiClientBase } from './api.base'
import { REFRESH_TOKEN_COOKIE_NAME } from '../auth/constants'
import { User } from '../auth/types'

export class ApiClient extends ApiClientBase {
  protected static instance: ApiClient
  protected deferredAccessToken: Deferred<string> | null = null

  protected constructor(protected readonly baseUrl: string) {
    super()
    // Private constructor to prevent instantiation
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(process.env.NEXT_PUBLIC_API_URL!)
    }
    return ApiClient.instance
  }

  public async getAccessToken() {
    if (!this.deferredAccessToken)
      await this.refreshTokens()

    const accessToken = await this.deferredAccessToken!.unwrap()

    const payload = decodeJwt<User>(accessToken)

    const user: User = {
      username: payload.username,
      permissions: payload.permissions,
    }

    return { accessToken, user }
  }

  protected async getAuthCookies() {
    return {
      refreshToken: Cookies.get(REFRESH_TOKEN_COOKIE_NAME),
    }
  }

  protected async setAuthCookies(refreshToken: string, accessToken?: string) {
    if (!this.deferredAccessToken)
      this.deferredAccessToken = new Deferred<string>()
    if (accessToken) {
      if (this.deferredAccessToken.status !== 'pending')
        this.deferredAccessToken.reset()
      this.deferredAccessToken.resolve(accessToken)
    } else {
      this.deferredAccessToken.reject()
      this.deferredAccessToken.reset()
    }
    Cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, this.refreshTokenCookieSharedOptions)
  }

  protected async clearAuthCookies() {
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME)
  }
}
