'use client'

import { DotIcon } from 'lucide-react'
import Link from 'next/link'

export function TerritoryListItem({ territory }: { territory: { number: string, color: string } }) {
  return (
    <li key={territory.number} className="mb-4">
      <Link href={`/territorios/${territory.number}`}>
        <h2 className="flex items-center text-base font-semibold uppercase tracking-tight py-3.5">
          <span className="flex items-center h-0 align-middle">
            <DotIcon className="-mx-1" size={48} color={territory.color} />
          </span>
          Território {territory.number}
        </h2>
      </Link>
    </li>
  )
}
