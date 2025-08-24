'use client'

import { useRouter } from 'next/navigation'
import { PropsWithChildren, useEffect, useState } from 'react'

import { ApiClient } from '~/features/api/api.client'
import { useAuth } from '~/features/auth/auth.context'

import Loading from '../loading'

export default function AuthLayout({ children }: PropsWithChildren) {
  const { login, logout } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ApiClient.getInstance().getAccessToken()
      .then(data => login(data.accessToken, data.user))
      .catch(err => {
        console.error('Could not login user', err)
        logout()
        router.push('/logout')
      })
      .finally(() => setLoading(false))
  }, [login, logout, router])

  if (loading) return <Loading />

  return <>{children}</>
}
