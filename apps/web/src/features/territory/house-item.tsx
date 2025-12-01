'use client'

import { StatusUpdate as StatusUpdateComponent } from '@repo/ui/components/status-update'
import { formatHouseNumber } from '@repo/utils/house'
import { PhoneOffIcon } from 'lucide-react'
import { useState } from 'react'

import { AddHistoryDialog } from './dialogs/add-history.dialog'
import { DeleteHouseDialog } from './dialogs/delete-house-dialog'
import { EditHouseDialog } from './dialogs/edit-house-dialog'
import { House } from './types'

interface Props {
  house: House
  territoryId: number
  territoryNumber: string
  streetId: number
}

export function HouseItem({ house, territoryId, territoryNumber, streetId }: Props) {
  const [openDialog, setOpenDialog] = useState<'add-registry' | 'delete-house' | 'edit-house' | null>(null)

  return (
    <>
      <button
        type="button"
        className="flex flex-col gap-1.5 w-full py-2.5 px-5 font-normal text-left hover:bg-gray-100/50 active:bg-gray-200 transition-colors"
        onClick={() => setOpenDialog('add-registry')}
      >
        <div className="flex w-full items-center">
          <span className="flex items-center mr-auto font-semibold tracking-tight">
            {formatHouseNumber(house)}
            {!house.phones.length && <PhoneOffIcon size={14} className="ml-3 text-muted-foreground" />}
          </span>
          {house.updates?.[0] && <span className="ml-auto text-right"><StatusUpdateComponent status={house.updates[0]} /></span>}
        </div>
        {house.observation && (
          <div className="text-left text-xs -ml-1.5 -mr-2.5 py-1 px-2 rounded-md text-sidebar-primary-foreground bg-sidebar-primary caret-up-sidebar-primary">
            {house.observation}
          </div>
        )}
      </button>

      <AddHistoryDialog
        open={openDialog === 'add-registry'}
        context={{ territoryId, territoryNumber, houseId: house.id, streetId, phones: house.phones }}
        onClose={() => setOpenDialog(null)}
        onOpenDelete={() => setOpenDialog('delete-house')}
        onOpenEdit={() => setOpenDialog('edit-house')}
      />

      <DeleteHouseDialog
        open={openDialog === 'delete-house'}
        context={{ territoryId, territoryNumber, streetId, houseId: house.id }}
        onClose={() => setOpenDialog(null)}
      />

      <EditHouseDialog
        open={openDialog === 'edit-house'}
        context={{ territoryId, territoryNumber, streetId, house }}
        onClose={() => setOpenDialog(null)}
      />
    </>
  )
}
