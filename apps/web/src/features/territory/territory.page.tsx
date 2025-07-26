'use client'

import { Accordion } from '@repo/ui/components/ui/accordion'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { useParams } from 'next/navigation'

import Loading from '~/app/loading'
import territoryImageFallback from '~/assets/territory.png'

import { StreetItem } from './street-item'
import TerritoryEvents from './territory.events'
import { Territory } from './types'
import { useEventStream } from '../events/events.hooks'
import { HeaderConfig } from '../header/context'

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

  return (
    <div className="flex flex-col flex-1 items-center">
      <HeaderConfig title={`Território ${number}`} backRoute="/territorios" showMap />
      {isLoading ? <Loading /> : (
        <>
          <Image src={territory?.imageUrl ?? territoryImageFallback} alt=""
            width={365} height={365}
            className="mb-4 mx-auto"
          />
          <Accordion type="single" className="w-full" collapsible>
            {territory?.streets.map(street => <StreetItem key={street.id} territoryId={territory.id} territoryNumber={territory.number} street={street} />)}
          </Accordion>
        </>
      )}
    </div>
  )
}
