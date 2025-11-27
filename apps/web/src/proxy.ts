import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { REDIRECT_AFTER_AUTH, REFRESH_TOKEN_COOKIE_NAME } from '~/features/auth/constants'

import { tryDecodeJwt } from './features/auth/token'

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value

  const isTokenValid = !!token && (tryDecodeJwt(token)?.exp ?? -1) >= Date.now() / 1000

  if (request.nextUrl.pathname.startsWith('/login')) {
    if (isTokenValid) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } else if (!isTokenValid) {
    cookieStore.set(REDIRECT_AFTER_AUTH, request.nextUrl.pathname + request.nextUrl.search, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    })
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const response = await NextResponse.next()

  if (process.env.NODE_ENV !== 'production') {
    response.headers.set('x-forwarded-host', 'localhost:3000')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|logout|offline|assets|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.well-known|sw.*.js).*)',
  ],
}
