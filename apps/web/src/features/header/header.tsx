'use client'

import { Button } from '@repo/ui/components/ui/button'
import { cn } from '@repo/ui/lib/utils'
import Cookies from 'js-cookie'
import { ChevronLeftIcon, MapIcon, UsersIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import GoogleIcon from '~/assets/google-icon.svg'

import { useHeader } from './context'
import { useAuth } from '../auth/auth.context'
import { REDIRECT_AFTER_AUTH } from '../auth/constants'

export function Header() {
  const { title, backRoute, show, hidden } = useHeader()

  const router = useRouter()
  const { can } = useAuth()

  const shouldShowBackButton = !!backRoute

  function handleBackClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!backRoute) return

    e.preventDefault()
    if (canGoBack() && backRoute === true)
      router.back()
    else
      router.push(backRoute === true ? '/territorios' : backRoute)
  }

  function handleLogout() {
    Cookies.set(REDIRECT_AFTER_AUTH, location.pathname + location.search)
    router.push('/logout?providers=google')
  }

  return (
    <>
      <div className="fixed w-full top-0 z-10 bg-primary text-primary-foreground shadow-md">
        <nav className="container py-0 h-16 flex items-center justify-end gap-1">
          <h1 className="flex items-center mr-auto ml-0 text-xl font-semibold">
            <Button
              variant="ghost"
              className={cn(
                '-ml-1 rounded-full accessible-text-primary-foreground w-12 h-12 p-0! transition-all',
                !shouldShowBackButton && 'w-0 mx-2 opacity-0 pointer-events-none',
              )}
              asChild
            >
              <Link href={'/'} className="flex items-center" onClick={handleBackClick}>
                <ChevronLeftIcon
                  className="h-5 mt-0.5 size-6"
                  strokeWidth={2.5}
                />
              </Link>
            </Button>
            {title}
          </h1>

          {!hidden?.includes('users') && can('users:read') && can('users:write') && (
            <>
              {can('safe') ? (
                <Button variant="ghost" className="rounded-full accessible-text-primary-foreground size-12" asChild>
                  <Link href="/usuarios">
                    <UsersIcon className="size-5" />
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" className="rounded-full accessible-text-primary-foreground size-12" onClick={handleLogout}>
                  <GoogleIcon className="size-4" />
                </Button>
              )}
            </>
          )}

          {!!show?.includes('map') && (
            <Button variant="ghost" className="rounded-full accessible-text-primary-foreground size-12" asChild>
              <Link href="/mapa-completo">
                <MapIcon className="size-6" />
              </Link>
            </Button>
          )}
        </nav>
      </div>
      <div className="block flex-1 shrink-0 basis-16 w-full" />
    </>
  )
}

function canGoBack() {
  return window.history.length > 2
}
