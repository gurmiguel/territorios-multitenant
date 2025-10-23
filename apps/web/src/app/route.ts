import { cookies } from 'next/headers'
import { redirect, RedirectType } from 'next/navigation'

import { REDIRECT_AFTER_AUTH, REFRESH_TOKEN_COOKIE_NAME } from '~/features/auth/constants'
import { tryDecodeJwt } from '~/features/auth/token'

export async function GET() {
  const cookieStore = await cookies()
  const isAuthenticated = (tryDecodeJwt(cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value)?.exp ?? 0) >= Date.now() / 1000

  if (!isAuthenticated)
    redirect('/login', RedirectType.replace)

  let redirectUrl = cookieStore.get(REDIRECT_AFTER_AUTH)

  if (redirectUrl?.value === '/')
    redirectUrl = undefined

  cookieStore.delete(REDIRECT_AFTER_AUTH)

  redirect(redirectUrl?.value ?? '/territorios', RedirectType.push)
}

export const POST = GET
