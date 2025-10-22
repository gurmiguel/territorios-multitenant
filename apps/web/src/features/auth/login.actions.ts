'use server'

import { redirect } from 'next/navigation'

import { ActionResponse, AuthErrorType, AuthResponse } from './types'
import { ApiError } from '../api/api.base'
import { ServerApiClient } from '../api/api.server'
import { getTenant } from '../api/utils.server'

export async function emailLogin(prevState: ActionResponse, data: FormData): Promise<ActionResponse> {
  const api = ServerApiClient.getInstance()

  const email = data.get('email')?.toString()
  const name = data.get('name')?.toString()

  const tenant = await getTenant()

  try {
    const endpoints = {
      login: ['/auth/login', { username: email }],
      register: ['/auth/signup', { email, name }],
    } as const

    const action = name !== undefined ? 'register' : 'login'

    const [endpoint, payload] = endpoints[action]

    const { access_token, refresh_token } = await api.mutate<AuthResponse>(endpoint, { ...payload, tenant })

    await api.authenticate(access_token, refresh_token)
  } catch (e) {
    console.error('Error during authentication:', e)
    if (e instanceof ApiError && e.status === 401) {
      return { success: false, errorType: AuthErrorType.UserNotExists, error: AuthErrorType.UserNotExists, persist: { email, name } }
    }

    return { errorType: AuthErrorType.Unknown, ...prevState ?? {}, success: false, error: (e as Error).message, persist: { email: email, name } }
  }

  redirect('/')
}

export async function initGoogleSignIn(returnUrl: string) {
  const api = ServerApiClient.getInstance()

  const tenant = await getTenant()

  redirect(api.buildUrl(`/auth/google?redirectUrl=${returnUrl}&tenant=${tenant}`))
}
