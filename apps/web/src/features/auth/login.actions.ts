'use server'

import { redirect } from 'next/navigation'

import { ServerApiClient } from '../api/api.server'
import { getTenant } from '../api/utils.server'

export async function emailLogin(data: FormData) {
  const api = ServerApiClient.getInstance()

  const username = data.get('email')?.toString()

  const tenant = process.env.NODE_ENV === 'production'
    ? await getTenant()
    : 'alemanha'

  const { access_token, refresh_token } = await api.mutate<Record<`${'access' | 'refresh'}_token`, string>>('/auth/login', { username, tenant })

  await api.authenticate(access_token, refresh_token)

  redirect('/')
}

export async function initGoogleSignIn(returnUrl: string) {
  const api = ServerApiClient.getInstance()

  const tenant = process.env.NODE_ENV === 'production'
    ? await getTenant()
    : 'alemanha'

  redirect(api.buildUrl(`/auth/google?redirectUrl=${returnUrl}&tenant=${tenant}`))
}
