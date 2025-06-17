import { StatusUpdate as StatusUpdateComponent } from '@repo/ui/components/status-update'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/ui/accordion'
import { formatHouseNumber, sortHouses } from '@repo/utils/house'
import { PhoneOffIcon } from 'lucide-react'
import { useMemo } from 'react'

import { StatusUpdate, Street } from './types'

interface Props {
  street: Street
}

export function StreetItem({ street }: Props) {
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
        {lastUpdate && <span className="text-right"><StatusUpdateComponent status={lastUpdate} /></span>}
      </AccordionTrigger>
      <AccordionContent>
        {houses.map(house => (
          <div key={house.id}>
            <button type="button" className="flex items-center w-full py-2.5 px-5 font-normal text-left hover:bg-gray-100/50 active:bg-gray-200 transition-colors">
              <span className="flex items-center mr-auto">
                {formatHouseNumber(house)}
                {!house.phones.length && <PhoneOffIcon size={14} className="ml-3 text-muted-foreground" />}
              </span>
              {house.updates[0] && <span className="ml-auto text-right">{<StatusUpdateComponent status={house.updates[0]} />}</span>}
            </button>
            <span className="block h-[0.5px] w-95/100 bg-gray-300/80 mx-auto" />
          </div>
        ))}
      </AccordionContent>
    </AccordionItem>
  )
}
