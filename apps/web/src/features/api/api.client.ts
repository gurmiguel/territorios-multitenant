'use client'

import Cookies from 'js-cookie'

import { ApiClientBase } from './api.base'
import { REFRESH_TOKEN_COOKIE_NAME } from '../auth/constants'

export class ApiClient extends ApiClientBase {
  protected static instance: ApiClient

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

  protected async getAuthCookies() {
    return {
      refreshToken: Cookies.get(REFRESH_TOKEN_COOKIE_NAME),
    }
  }

  protected async setAuthCookies(refreshToken: string) {
    Cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, this.refreshTokenCookieSharedOptions)
  }

  protected async clearAuthCookies() {
    Cookies.remove(REFRESH_TOKEN_COOKIE_NAME)
  }
}
