'use client'

import { ChevronLeftIcon, MapIcon } from 'lucide-react'
import Link from 'next/link'
import { useParams, usePathname, useRouter } from 'next/navigation'

import { cn } from '../lib/utils'

import type { Params } from 'next/dist/server/request/params'

const pages = Array.from(new Map([
  [/^\/login$/, { route: 'login', title: () => 'Login' }] as const,
  [/^\/territorios$/, { route: 'territories', title: () => 'Territórios' }] as const,
  [/^\/territorios\/(\d*)$/, { route: 'territory', title: ({ number }: Params) => `Território ${number}` }] as const,
  [/^\/mapa-completo$/, { route: 'map', title: () => 'Mapa Completo' }] as const,
]).entries())

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()

  const [ , page ] = pages.find(([regex]) => new RegExp(regex).test(pathname)) ?? [null, null]

  const shouldShowBackButton = page?.route && !['login', 'territories'].includes(page.route)
  const shouldShowMapButton = page?.route && !['login'].includes(page.route)

  function handleBackClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    if (canGoBack() && page?.route === 'map')
      router.back()
    else
      router.push('/territorios')
  }

  return (
    <div className="bg-primary text-primary-foreground shadow-md">
      <nav className="container py-0 h-16 flex items-center justify-end">
        <h1 className="flex items-center mr-auto ml-0 text-xl font-semibold">
          <a href="/territorios" className="flex items-center" onClick={handleBackClick}>
            <ChevronLeftIcon
              className={cn(!shouldShowBackButton && 'w-0 opacity-0', 'h-5 mt-0.5 -ml-2 mr-2 transition-all')}
              strokeWidth={2.5}
            />
          </a>
          {page?.title(params)}
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
