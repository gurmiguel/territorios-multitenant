'use client'

import Cookies from 'js-cookie'
import { useRouter } from 'next/navigation'
import { useEffect, useEffectEvent } from 'react'

import { REDIRECT_AFTER_AUTH, REFRESH_TOKEN_COOKIE_NAME } from '~/features/auth/constants'
import { tryDecodeJwt } from '~/features/auth/token'

export default function HomePage() {
  const router = useRouter()

  const onPageLoad = useEffectEvent(() => {
    const isAuthenticated = (tryDecodeJwt(Cookies.get(REFRESH_TOKEN_COOKIE_NAME))?.exp ?? 0) >= Date.now() / 1000

    if (!isAuthenticated)
      router.replace('/login')

    let redirectUrl = Cookies.get(REDIRECT_AFTER_AUTH)

    if (redirectUrl === '/')
      redirectUrl = undefined

    Cookies.remove(REDIRECT_AFTER_AUTH)

    if (redirectUrl || process.env.NODE_ENV === 'production') // due to StrictMode, this will run twice in dev, causing it to always go to homepage
      router.push(redirectUrl ?? '/territorios')
  })

  useEffect(() => {
    onPageLoad()
  }, [])

  return null
}
