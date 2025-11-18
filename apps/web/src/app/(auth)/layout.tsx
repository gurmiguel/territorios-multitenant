'use client'

import { delay } from '@repo/utils/delay'
import { useRouter } from 'next/navigation'
import { PropsWithChildren, useEffect, useState } from 'react'
import { useNetworkState } from 'react-use'

import { ApiError } from '~/features/api/api.base'
import { ApiClient } from '~/features/api/api.client'
import { useAuth } from '~/features/auth/auth.context'

import Loading from '../loading'

let swRegistered = false

export default function AuthLayout({ children }: PropsWithChildren) {
  const { login, logout } = useAuth()
  const router = useRouter()

  const network = useNetworkState()

  const [loading, setLoading] = useState(true)

  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setIsReady(true), 1000)
    return () => clearTimeout(timeout)
  }, [])

  useEffect(() => {
    if (!loading) return

    if (!network.online) {
      setLoading(false)
      return
    }

    ApiClient.getInstance().getAccessToken()
      .then(data => {
        login(data.accessToken, data.user)
      })
      .then(async () => {
        if (!swRegistered && 'serviceWorker' in navigator && window.serwist !== undefined) {
          swRegistered = true
          const reg = await window.serwist.register()
          if (reg?.active) return true

          const nextSw = reg?.installing ?? reg?.waiting
          if (nextSw) {
            return Promise.race([
              delay(5000).then(() => false),
              new Promise<boolean>(resolve => {
                nextSw.addEventListener('statechange', () => {
                  switch (nextSw.state) {
                    case 'activated':
                      return resolve(true)
                    case 'redundant':
                      router.refresh()
                      return resolve(false)
                  }
                })
              }),
            ])
          }
          return false
        }
      })
      .then(() => setLoading(false))
      .catch(err => {
        if (!isReady) return
        console.error('Could not login user', err)
        if (!navigator.onLine || err instanceof ApiError && err.status === 499) {
          setLoading(false)
        } else {
          logout()
          router.push('/logout')
        }
      })
  }, [isReady, loading, login, logout, network.online, router])

  if (loading) return <Loading />

  return <>{children}</>
}
