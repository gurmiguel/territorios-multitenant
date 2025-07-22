import { StatusUpdate as StatusUpdateComponent } from '@repo/ui/components/status-update'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/ui/accordion'
import { sortHouses } from '@repo/utils/house'
import { useMemo } from 'react'

import { HouseItem } from './house-item'
import { StatusUpdate, Street } from './types'

interface Props {
  territoryId: string
  territoryNumber: string
  street: Street
}

export function StreetItem({ territoryId, territoryNumber, street }: Props) {
  const houses = useMemo(() => sortHouses(street.houses), [street.houses])
  const lastUpdate = useMemo(() => street.houses.reduce<StatusUpdate | null>((acc, house) => {
    const [update] = house.updates || []
    if (!update || update.status !== 'OK') return acc
    if (!acc) return update
    return update && new Date(update.date) > new Date(acc.date) ? update : acc
  }, null), [street.houses])

  return (
    <AccordionItem value={street.id.toString()}>
      <AccordionTrigger className="py-3 px-4 text-md font-normal" iconless>
        <span className="ml-0">{street.name}</span>
        {lastUpdate && <span className="text-right"><StatusUpdateComponent status={lastUpdate} hideIcon /></span>}
      </AccordionTrigger>
      <AccordionContent>
        {houses.map(house => (
          <div key={house.id}>
            <HouseItem house={house} territoryId={territoryId} territoryNumber={territoryNumber} streetId={street.id} />
            <span className="block h-[0.5px] w-95/100 bg-gray-300/80 mx-auto" />
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}
