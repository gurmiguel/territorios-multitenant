import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { REDIRECT_AFTER_AUTH, REFRESH_TOKEN_COOKIE_NAME } from '~/features/auth/constants'

import { tryDecodeJwt } from './features/auth/token'
import { detectCrawler, getFakeCrawlerToken } from '../../../packages/utils/src/crawler'

export async function proxy(request: NextRequest) {
  const cookieStore = await cookies()
  let token = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value
  let isTokenValid = !!token && (tryDecodeJwt(token)?.exp ?? -1) >= Date.now() / 1000

  // bypass authentication for crawlers
  if (detectCrawler(request.headers.get('user-agent') ?? '')) {
    token = getFakeCrawlerToken()
    isTokenValid = true
  }

  if (request.nextUrl.pathname.startsWith('/login')) {
    if (isTokenValid) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } else if (!isTokenValid) {
    if (request.nextUrl.pathname !== '/')
      cookieStore.set(REDIRECT_AFTER_AUTH, request.nextUrl.pathname + request.nextUrl.search, {
        httpOnly: false,
        secure: false,
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
    '/((?!api|politica-de-privacidade|termos-de-uso|logout|offline|assets|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|.well-known|sw.*.js).*)',
  ],
}
