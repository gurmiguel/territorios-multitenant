'use client'

import { Accordion } from '@repo/ui/components/ui/accordion'
import { Button } from '@repo/ui/components/ui/button'
import { MapIcon, PlusIcon } from '@repo/ui/components/ui/icons'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { subMonths } from 'date-fns'
import Image from 'next/image'
import { useParams } from 'next/navigation'
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

export default function TerritoryPage() {
  const queryClient = useQueryClient()

  const { number } = useParams()

  const { data: territory, isLoading } = useQuery<Territory>({
    queryKey: ['territories', String(number)],
  })

  useEventStream(`territories/${territory?.id}/updates`, {
    handler: new TerritoryEvents(queryClient),
    enabled: !!territory,
  })

  const [openDialog, setOpenDialog] = useState<'add-street' | null>(null)

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

  return (
    <div className="flex flex-col flex-1 items-center">
      <HeaderConfig title={`Território ${number}`} backRoute="/territorios" showMap />

      {isLoading && <Loading />}

      {!!territory && (
        <>
          <Image src={territory.imageUrl ?? territoryImageFallback} alt=""
            width={365} height={365}
            className="mb-4 mx-auto"
          />

          <div className="w-full flex justify-between items-center mb-3">
            <p className="text-sm text-left">A Trabalhar: <strong className="text-lg align-[-0.075em]">{missingHouses}</strong></p>
            <div className="flex items-center space-x-2 ml-auto">
              <Button variant="default" className="rounded-full size-12 px-0! py-0 accessible-bg-secondary-foreground">
                <MapIcon className="size-5" />
                {/* TODO: implement map dialog/link */}
              </Button>
              <Button variant="default" className="rounded-full size-12 px-0! py-0 accessible-bg-whatsapp" onClick={handleWhatsappClick}>
                <WhatsappIcon className="size-5" fill="var(--color-white)" />
              </Button>
            </div>
          </div>

          <Accordion type="single" className="w-full" collapsible>
            {territory.streets.map(street => <StreetItem key={street.id} territoryId={territory.id} territoryNumber={territory.number} street={street} />)}

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
          </Accordion>

          <AddStreetDialog
            open={openDialog === 'add-street'}
            context={{ territoryId: territory.id, territoryNumber: territory.number }}
            onClose={() => setOpenDialog(null)}
          />
        </>
      )}
    </div>
  )
}
