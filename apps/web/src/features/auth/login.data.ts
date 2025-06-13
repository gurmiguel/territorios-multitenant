'use server'

import { redirect } from 'next/navigation'
import { ServerApiClient } from '../api/api.server'
import { headers } from 'next/headers'

export async function emailLogin(data: FormData) {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''

  const username = data.get('email')?.toString()

  const tenant = process.env.NODE_ENV === 'production' ? host : 'alemanha'

  const { access_token, refresh_token } = await ServerApiClient.getInstance().fetch<Record<`${'access' | 'refresh'}_token`, string>>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, tenant })
  })

  await ServerApiClient.getInstance().authenticate(access_token, refresh_token)

  redirect('/')
}

export async function initGoogleSignIn(returnUrl: string) {
  const headersList = await headers()
  const host = headersList.get('host') ?? ''

  const tenant = process.env.NODE_ENV === 'production' ? host : 'alemanha'

  redirect(ServerApiClient.getInstance().buildUrl(`/auth/google?redirectUrl=${returnUrl}&tenant=${tenant}`))
}