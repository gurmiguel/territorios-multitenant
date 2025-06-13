import { decodeJwt } from 'jose'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { REDIRECT_AFTER_AUTH, REFRESH_TOKEN_COOKIE_NAME } from '~/features/auth/constants'

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value

  const isTokenValid = !!token && decodeJwt(token).exp! >= Date.now() / 1000

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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|logout|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)',
  ],
}
