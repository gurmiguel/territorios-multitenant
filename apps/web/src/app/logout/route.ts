import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

import { ACCESS_TOKEN_COOKIE_NAME, REFRESH_TOKEN_COOKIE_NAME } from '~/features/auth/constants'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()

  cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME)
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME)

  redirect('/login' + request.nextUrl.search)
}
