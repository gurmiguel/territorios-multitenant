import parseDuration from 'parse-duration'

export abstract class ApiClientBase {
  protected abstract readonly baseUrl: string

  protected accessToken?: string
  protected refreshToken?: string

  public async fetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    await this.loadAuthTokens()

    options.headers ??= {}
    options.headers['Content-Type'] ??= 'application/json'

    if (this.accessToken) {
      options.headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    let response = await fetch(this.buildUrl(url), options)

    if (response.status === 401 && this.refreshToken) {
      try {
        response = await this.retryWithRefreshToken(url, options)
      } catch (ex) {
        console.error(ex)
      }
    }

    if (!response.ok)
      throw new Error(`HTTP error! status: ${response.status}`)

    return response.json()
  }

  public async mutate<T>(url: string, data: any, options?: RequestInit): Promise<T> {
    return this.fetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    })
  }

  protected buildUrl(url: string) {
    if (!url.startsWith('http'))
      url = [this.baseUrl, url.replace(/^\//, '')].join('/')

    return url
  }

  protected async loadAuthTokens() {
    if (this.accessToken) return

    const { accessToken, refreshToken } = await this.getAuthCookies()

    this.accessToken = accessToken
    this.refreshToken = refreshToken

    if (!accessToken) {
      await this.refreshTokens()
    }
  }

  protected async retryWithRefreshToken(url: string, options: RequestInit = {}) {
    try {
      const response = await fetch(this.buildUrl('/auth/refresh'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      })

      const data = await response.json() as Record<`${'access' | 'refresh'}_token`, string>

      this.accessToken = data.access_token
      this.refreshToken = data.refresh_token

      options.headers!['Authorization'] = `Bearer ${this.accessToken}`

      // Retry the original request with the new token
      return await fetch(this.buildUrl(url), options)
    } catch (ex) {
      this.refreshToken = undefined // Clear refresh token if refresh fails
      await this.clearAuthCookies()
      throw new Error('Failed to refresh token', ex as Error)
    }
  }

  protected async refreshTokens() {
    this.refreshToken ??= (await this.getAuthCookies()).refreshToken

    const response = await fetch(this.buildUrl('/auth/refresh'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    })

    const { access_token, refresh_token } = await response.json()

    this.accessToken = access_token
    this.refreshToken = refresh_token

    await this.setAuthCookies(refresh_token, access_token)
  }

  protected abstract getAuthCookies(): Promise<{ accessToken?: string, refreshToken?: string }>
  protected abstract setAuthCookies(refreshToken: string, accessToken?: string): Promise<void>
  protected abstract clearAuthCookies(): Promise<void>

  protected refreshTokenCookieSharedOptions = {
    secure: process.env.NODE_ENV === 'production',
    maxAge: parseDuration('60 days')!,
  }
}
