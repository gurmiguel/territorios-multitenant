'use client'

import { cn } from '@repo/ui/lib/utils'
import { ChevronLeftIcon, MapIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { useHeader } from './context'

export function Header() {
  const { title, backRoute, showMap } = useHeader()

  const router = useRouter()

  const shouldShowBackButton = !!backRoute
  const shouldShowMapButton = !!showMap

  function handleBackClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!backRoute) return

    e.preventDefault()
    if (canGoBack() && backRoute === true)
      router.back()
    else
      router.push(backRoute === true ? '/territorios' : backRoute)
  }

  return (
    <div className="bg-primary text-primary-foreground shadow-md">
      <nav className="container py-0 h-16 flex items-center justify-end">
        <h1 className="flex items-center mr-auto ml-0 text-xl font-semibold">
          <Link href={'/'} className="flex items-center" onClick={handleBackClick}>
            <ChevronLeftIcon
              className={cn(!shouldShowBackButton && 'w-0 opacity-0', 'h-5 mt-0.5 -ml-2 mr-2 transition-all')}
              strokeWidth={2.5}
            />
          </Link>
          {title}
        </h1>

        {!!shouldShowMapButton && (
          <Link href="/mapa-completo">
            <MapIcon className="mr-4" size={24} />
          </Link>
        )}
      </nav>
    </div>
  )
}

function canGoBack() {
  return window.history.length > 2
}
