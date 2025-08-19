'use client'

import { cn } from '@repo/ui/lib/utils'
import { DotIcon } from 'lucide-react'
import Link from 'next/link'

export function TerritoryListItem({ territory }: { territory: { number: string, color: string } }) {
  return (
    <li key={territory.number}>
      <Link
        href={`/territorios/${territory.number}`}
        className={cn([
          'hover:bg-gray-100 focus-visible:bg-gray-100',
          'active:bg-gray-200/80',
          'disabled:pointer-events-none disabled:opacity-50',
          'flex flex-1 items-center justify-between rounded-0 text-left bg-white transition-all outline-none',
        ])}
      >
        <h2 className="flex items-center text-base font-semibold uppercase tracking-tight py-3.5">
          <span className="flex items-center h-0 align-middle">
            <DotIcon className="-mx-1" size={48} color={territory.color} />
          </span>
          Território {territory.number}

          {/* TODO: implement missing houses counter */}
        </h2>
      </Link>
    </li>
  )
}
