'use client'

import { StatusUpdate } from '@repo/ui/components/status-update'
import { cn } from '@repo/ui/lib/utils'
import { DotIcon, EyeOffIcon } from 'lucide-react'
import Link from 'next/link'
import { ComponentProps, useState } from 'react'

import { EditTerritoryDialog } from '../territory/dialogs/edit-territory.dialog'
import { TerritoryListItem as ITerritoryListItem } from '../territory/types'

interface Props {
  territory: ITerritoryListItem
}

const CustomDotIcon = (props: ComponentProps<typeof DotIcon>) =>
  <DotIcon {...props} size={48} className={cn(props.className, '-mx-1')} />

export function TerritoryListItem({ territory }: Props) {
  const [openDialog, setOpenDialog] = useState<'edit-territory' | null>(null)

  function handleOpenEditDialog(e: React.MouseEvent<HTMLAnchorElement>): void {
    e.preventDefault()

    setOpenDialog('edit-territory')
  }

  const Icon = territory.hidden ? EyeOffIcon : CustomDotIcon

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
            territory.hidden && 'opacity-60 grayscale',
          ])}
          onContextMenu={handleOpenEditDialog}
        >
          <div className="flex-1 flex items-center text-base font-semibold uppercase tracking-tight py-3.5 pr-4">
            <span className="flex items-center h-0 align-middle">
              <Icon className="mx-3 mr-2.75" size={18} color={territory.color} />
            </span>
            Território {territory.number}

            <span className="ml-auto text-right">
              <StatusUpdate count={territory.pendingHouses} hideIcon />
            </span>
          </div>
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
