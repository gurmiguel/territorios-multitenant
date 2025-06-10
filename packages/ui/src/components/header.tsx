'use client'

import { MapIcon } from 'lucide-react'
import Link from 'next/link'

export function Header() {
  return (
    <div className="bg-primary text-primary-foreground shadow-md">
      <nav className="container py-0 h-16 flex items-center justify-end">
        <h1 className="mr-auto ml-0 text-xl font-semibold">
          Territórios
        </h1>

        <Link href="/mapa-completo">
          <MapIcon className="mr-4" size={24} />
        </Link>
      </nav>
    </div>
  )
}
