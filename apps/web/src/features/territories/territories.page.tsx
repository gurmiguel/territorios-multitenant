'use client'

import { PlusIcon } from '@repo/ui/components/ui/icons'
import { cn } from '@repo/ui/lib/utils'
import { PAGES_CACHE_NAME } from '@serwist/next/worker'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import Loading from '~/app/loading'

import { TerritoryListItem } from './territory-list-item'
import { useAuth } from '../auth/auth.context'
import { HeaderConfig } from '../header/context'
import { AddTerritoryDialog } from '../territory/dialogs/add-territory.dialog'
import { TerritoryListItem as ITerritoryListItem } from '../territory/types'

export function TerritoriesPage() {
  const queryClient = useQueryClient()
  const { can, cannot } = useAuth()

  const router = useRouter()

  const { data, isLoading } = useQuery<{items: ITerritoryListItem[]}>({
    queryKey: ['territories'],
    refetchOnReconnect: true,
    select({ items }) {
      if (cannot('territories:write'))
        return { items: items.filter(it => !it.hidden) }
      return { items }
    },
  })

  useEffect(() => {
    if (!data?.items.length) return

    caches.open(PAGES_CACHE_NAME.html).then(async cache => {
      const cachedPages = await cache.matchAll()

      for (const territory of data.items) {
        const url = `/territorios/${territory.number}`
        if (cachedPages.some(res => new URL(res.url).pathname === url)) continue

        router.prefetch(url)
        queryClient.fetchQuery({
          queryKey: ['territories', territory.number],
        })
      }
    })
  }, [data?.items, queryClient, router])

  const [openDialog, setOpenDialog] = useState<'add-territory' | null>(null)

  return (
    <>
      {isLoading && <Loading />}

      <div className="flex">
        <HeaderConfig title="Territórios" showMap />

        <ul className="flex-1">
          {data?.items?.map(territory => (
            <TerritoryListItem key={territory.id}
              territory={territory}
            />
          ))}

          {!isLoading && can('territories:write') && (
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
          )}
        </ul>
      </div>

      <AddTerritoryDialog
        open={openDialog === 'add-territory'}
        onClose={() => setOpenDialog(null)}
      />
    </>
  )
}
