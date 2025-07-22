'use client'

import { StatusUpdate as StatusUpdateComponent } from '@repo/ui/components/status-update'
import { formatHouseNumber } from '@repo/utils/house'
import { PhoneOffIcon } from 'lucide-react'
import { useState } from 'react'

import { AddHistoryDialog } from './dialogs/add-history.dialog'
import { House } from './types'

interface Props {
  house: House
  territoryId: string
  territoryNumber: string
  streetId: string
}

export function HouseItem({ house, territoryId, territoryNumber, streetId }: Props) {
  const [openAddRegistry, setOpenAddRegistry] = useState(false)

  return (
    <>
      <button
        type="button"
        className="flex items-center w-full py-2.5 px-5 font-normal text-left hover:bg-gray-100/50 active:bg-gray-200 transition-colors"
        onClick={() => setOpenAddRegistry(true)}
      >
        <span className="flex items-center mr-auto">
          {formatHouseNumber(house)}
          {!house.phones.length && <PhoneOffIcon size={14} className="ml-3 text-muted-foreground" />}
        </span>
        {house.updates[0] && <span className="ml-auto text-right">{<StatusUpdateComponent status={house.updates[0]} />}</span>}
      </button>

      <AddHistoryDialog
        open={openAddRegistry}
        context={{ territoryId, territoryNumber, houseId: house.id, streetId, phones: house.phones }}
        onClose={() => setOpenAddRegistry(false)}
        onOpenDelete={() => alert('[Delete Dialog] Still under development')}
        onOpenEdit={() => alert('[Edit Dialog] Still under development')}
      />
    </>
  )
}
