import { cookies } from 'next/headers'
import { redirect, RedirectType } from 'next/navigation'
import { REDIRECT_AFTER_AUTH } from '~/features/auth/constants'

export async function GET() {
  const cookieStore = await cookies()
  let redirectUrl = cookieStore.get(REDIRECT_AFTER_AUTH)

  if (redirectUrl?.value === '/')
    redirectUrl = undefined

  cookieStore.delete(REDIRECT_AFTER_AUTH)

  redirect(redirectUrl?.value ?? '/territorios', RedirectType.push);
}
