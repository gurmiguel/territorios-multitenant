'use client'

import { Accordion } from '@repo/ui/components/ui/accordion'
import { Button } from '@repo/ui/components/ui/button'
import { MapIcon, PencilIcon, PlusIcon } from '@repo/ui/components/ui/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { subMonths } from 'date-fns'
import Image from 'next/image'
import { useMemo, useState } from 'react'

import Loading from '~/app/loading'
import territoryImageFallback from '~/assets/territory.png'
import WhatsappIcon from '~/assets/whatsapp-icon.svg'

import { StreetItem } from './street-item'
import TerritoryEvents from './territory.events'
import { Territory } from './types'
import { useEventStream } from '../events/events.hooks'
import { HeaderConfig } from '../header/context'
import { AddStreetDialog } from './dialogs/add-street.dialog'
import { MapLinkDialog } from './dialogs/map-link.dialog'
import { useAuth } from '../auth/auth.context'
import { EditImageDialog } from './dialogs/edit-image.dialog'
import { useParams } from '../hooks/use-params'

export default function TerritoryPage() {
  const queryClient = useQueryClient()

  const number = useParams(/territorios\/(\d+)/, 'number') ?? 'offline'

  const { can } = useAuth()

  const { data: territory, isLoading } = useQuery<Territory>({
    queryKey: ['territories', String(number)],
    enabled: number !== 'offline',
  })

  useEventStream(`territories/${territory?.id}/updates`, {
    handler: new TerritoryEvents(queryClient),
    enabled: !!territory,
  })

  const [openDialog, setOpenDialog] = useState<'add-street' | 'map-link' | 'edit-image' | null>(null)

  const missingHouses = useMemo(() => {
    let total = 0
    for (const street of territory?.streets || []) {
      for (const house of street.houses) {
        const [update] = house.updates || []
        if (update?.status === 'OK' && new Date(update.date) >= subMonths(new Date(), 4))
          continue
        total++
      }
    }
    return total
  }, [territory?.streets])

  function handleWhatsappClick() {
    const whatsappText = `${window?.location.href}\n\nTerritório ${number}`

    window.open(`https://wa.me/?text=${encodeURIComponent(whatsappText)}`, '_blank')
  }

  function handleMapClick() {
    if (!territory) return

    if (can('territories:write'))
      return setOpenDialog('map-link')

    window.open(territory.map!, '_blank')
  }

  return (
    <div className="flex flex-col flex-1 items-center">
      <HeaderConfig title={`Território ${number}`} backRoute="/territorios" showMap />

      {isLoading && <Loading />}

      {!!territory && (
        <>
          <div className="relative w-full">
            <Image src={territory.imageUrl ?? territoryImageFallback} alt=""
              width={365} height={365}
              className="mb-4 mx-auto"
            />
            {can('assets:write') && can('territories:write') && (
              <Button variant="ghost" color="foreground"
                className="absolute top-3 right-2 rounded-full size-12 p-0!"
                onClick={() => setOpenDialog('edit-image')}
              >
                <PencilIcon className="size-5" />
              </Button>
            )}
          </div>

          <div className="w-full flex justify-between items-center mb-3">
            {territory.streets.length > 0 && <p className="text-sm text-left">A Trabalhar: <strong className="text-lg align-[-0.075em]">{missingHouses}</strong></p>}
            <div className="flex items-center space-x-2 ml-auto">
              {(can('territories:write') || !!territory.map) && (
                <Button variant="default"
                  className="rounded-full size-12 px-0! py-0 accessible-bg-secondary-foreground"
                  onClick={handleMapClick}
                >
                  <MapIcon className="size-5" />
                </Button>
              )}
              <Button variant="default" className="rounded-full size-12 px-0! py-0 accessible-bg-whatsapp" onClick={handleWhatsappClick}>
                <WhatsappIcon className="size-5" fill="var(--color-white)" />
              </Button>
            </div>
          </div>

          <Accordion type="single" className="w-full" collapsible>
            {territory.streets.map(street => (
              <StreetItem key={street.id}
                territoryId={territory.id}
                territoryNumber={territory.number}
                street={street}
              />
            ))}

            {can('streets:write') && (
              <button
                type="button"
                className="flex items-center w-full py-2.5 pl-1 pr-4 font-normal text-left hover:bg-gray-100/50 active:bg-gray-200 transition-colors uppercase"
                onClick={() => setOpenDialog('add-street')}
              >
                <PlusIcon size={14} />
                <span className="flex items-center ml-1 font-semibold tracking-tight text-sm">
                  Adicionar Rua
                </span>
              </button>
            )}
          </Accordion>

          <AddStreetDialog
            open={openDialog === 'add-street'}
            context={{ territoryId: territory.id, territoryNumber: territory.number }}
            onClose={() => setOpenDialog(null)}
          />

          <MapLinkDialog
            open={openDialog === 'map-link'}
            context={{ territoryId: territory.id, territoryNumber: territory.number, map: territory.map }}
            onClose={() => setOpenDialog(null)}
          />

          <EditImageDialog
            open={openDialog === 'edit-image'}
            context={{ territoryId: territory.id, territoryNumber: territory.number, imageUrl: territory.imageUrl }}
            onClose={() => setOpenDialog(null)}
          />
        </>
      )}
    </div>
  )
}
