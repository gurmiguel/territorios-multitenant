'use client'

import { StatusUpdate } from '@repo/ui/components/status-update'
import { cn } from '@repo/ui/lib/utils'
import { DotIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { EditTerritoryDialog } from '../territory/dialogs/edit-territory.dialog'
import { TerritoryListItem as ITerritoryListItem } from '../territory/types'

interface Props {
  territory: ITerritoryListItem
}

export function TerritoryListItem({ territory }: Props) {
  const [openDialog, setOpenDialog] = useState<'edit-territory' | null>(null)

  function handleOpenEditDialog(e: React.MouseEvent<HTMLAnchorElement>): void {
    e.preventDefault()

    setOpenDialog('edit-territory')
  }

  return (
    <>
      <li>
        <Link
          href={`/territorios/${territory.number}`}
          className={cn([
            'hover:bg-gray-100 focus-visible:bg-gray-100',
            'active:bg-gray-200/80',
            'disabled:pointer-events-none disabled:opacity-50',
            'flex flex-1 items-center justify-between rounded-0 text-left bg-white transition-all outline-none',
          ])}
          onContextMenu={handleOpenEditDialog}
        >
          <h2 className="flex-1 flex items-center text-base font-semibold uppercase tracking-tight py-3.5 pr-4">
            <span className="flex items-center h-0 align-middle">
              <DotIcon className="-mx-1" size={48} color={territory.color} />
            </span>
            Território {territory.number}

            <span className="ml-auto text-right">
              <StatusUpdate count={territory.pendingHouses} hideIcon />
            </span>
          </h2>
        </Link>
      </li>

      <EditTerritoryDialog
        open={openDialog === 'edit-territory'}
        context={{ territory }}
        onClose={() => setOpenDialog(null)}
      />
    </>
  )
}
