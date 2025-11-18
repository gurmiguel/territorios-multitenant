import { StatusUpdate as StatusUpdateComponent } from '@repo/ui/components/status-update'
import { AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui/components/ui/accordion'
import { PlusIcon } from '@repo/ui/components/ui/icons'
import { sortHouses } from '@repo/utils/house'
import { MouseEvent, useMemo, useState } from 'react'

import { AddHouseDialog } from './dialogs/add-house-dialog'
import { DeleteStreetDialog } from './dialogs/delete-street.dialog'
import { HouseItem } from './house-item'
import { StatusUpdate, Street } from './types'
import { useAuth } from '../auth/auth.context'

interface Props {
  territoryId: number
  territoryNumber: string
  street: Street
}

export function StreetItem({ territoryId, territoryNumber, street }: Props) {
  const { can } = useAuth()

  const [openDialog, setOpenDialog] = useState<'add-house' | 'delete-street' | null>(null)

  const houses = useMemo(() => sortHouses(street.houses), [street.houses])
  const lastUpdate = useMemo(() => street.houses.reduce<StatusUpdate | null>((acc, house) => {
    const [update] = house.updates || []
    if (!update || update.status !== 'OK') return acc
    if (!acc) return update
    return update && new Date(update.date) > new Date(acc.date) ? update : acc
  }, null), [street.houses])

  function handleContextMenuOpen(e: MouseEvent<HTMLButtonElement>) {
    if (!can('streets:delete')) return

    e.preventDefault()

    setOpenDialog('delete-street')
  }

  return (
    <>
      <AccordionItem value={street.id.toString()}>
        <AccordionTrigger className="py-3 px-4 text-md font-normal" iconless onContextMenu={handleContextMenuOpen}>
          <span className="ml-0 tracking-tight">{street.name}</span>
          {lastUpdate && <span className="text-right"><StatusUpdateComponent status={lastUpdate} hideIcon /></span>}
        </AccordionTrigger>
        <AccordionContent>
          {houses.map(house => (
            <div key={house.id}>
              <HouseItem house={house}
                territoryId={territoryId}
                territoryNumber={territoryNumber}
                streetId={street.id}
              />
              <span className="block h-[0.5px] w-95/100 bg-gray-300/80 mx-auto" />
            </div>
          ))}

          {can('houses:write') && (
            <button
              type="button"
              className="flex items-center w-full py-2.5 px-5 font-normal text-left hover:bg-gray-100/50 active:bg-gray-200 transition-colors uppercase"
              onClick={() => setOpenDialog('add-house')}
            >
              <PlusIcon size={14} />
              <span className="flex items-center ml-1 font-semibold tracking-tight">
                Adicionar Casa
              </span>
            </button>
          )}
        </AccordionContent>
      </AccordionItem>

      <AddHouseDialog
        open={openDialog === 'add-house'}
        context={{
          territoryId,
          territoryNumber,
          streetId: street.id,
        }}
        onClose={() => setOpenDialog(null)}
      />

      <DeleteStreetDialog
        open={openDialog === 'delete-street'}
        context={{
          territoryId: territoryId,
          territoryNumber: territoryNumber,
          streetId: street.id,
          streetName: street.name,
          hasHouses: street.houses.length > 0,
        }}
        onClose={() => setOpenDialog(null)}
      />
    </>
  )
}
