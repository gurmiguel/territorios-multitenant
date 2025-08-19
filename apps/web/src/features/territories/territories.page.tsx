'use client'

import { PlusIcon } from '@repo/ui/components/ui/icons'
import { cn } from '@repo/ui/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import Loading from '~/app/loading'

import { TerritoryListItem } from './territory-list-item'
import { HeaderConfig } from '../header/context'
import { AddTerritoryDialog } from '../territory/dialogs/add-territory.dialog'
import { Territory } from '../territory/types'

export function TerritoriesPage() {
  const { data, isLoading } = useQuery<{items: Territory[]}>({
    queryKey: ['territories'],
  })

  const [openDialog, setOpenDialog] = useState<'add-territory' | null>(null)

  return (
    <>
      {isLoading && <Loading />}

      <div className="flex">
        <HeaderConfig title="Territórios" showMap />

        <ul className="flex-1">
          {data?.items?.map(territory => (
            <TerritoryListItem key={territory.id}
              territory={territory} />
          ))}
          {/* TODO: implement edit/delete territory */}

          <li>
            <button type="button"
              className={cn([
                'hover:bg-gray-100 focus-visible:bg-gray-100',
                'active:bg-gray-200/80',
                'disabled:pointer-events-none disabled:opacity-50',
                'flex flex-1 w-full items-center text-left bg-white transition-all outline-none p-3.5 pl-3.25',
              ])}
              onClick={() => setOpenDialog('add-territory')}>
              <PlusIcon size={16} />
              <span className="flex items-center ml-2.5 font-semibold tracking-tight text-md uppercase">
                Adicionar Território
              </span>
            </button>
          </li>
        </ul>
      </div>

      <AddTerritoryDialog
        open={openDialog === 'add-territory'}
        onClose={() => setOpenDialog(null)}
      />
    </>
  )
}
