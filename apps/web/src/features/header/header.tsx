'use client'

import { Button } from '@repo/ui/components/ui/button'
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
          <Button
            variant="ghost"
            className={cn(
              '-ml-2 rounded-full accessible-text-primary-foreground w-12 h-12 p-0! transition-all',
              !shouldShowBackButton && 'w-0 mr-2 opacity-0 pointer-events-none',
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

        {!!shouldShowMapButton && (
          <Button variant="ghost" className="rounded-full accessible-text-primary-foreground size-12" asChild>
            <Link href="/mapa-completo">
              <MapIcon className="size-6" />
            </Link>
          </Button>
        )}
      </nav>
    </div>
  )
}

function canGoBack() {
  return window.history.length > 2
}
