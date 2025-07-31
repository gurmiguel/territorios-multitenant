import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { useQueryClient } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'

import { ApiClient } from '~/features/api/api.client'

import TerritoryEvents from '../territory.events'

interface Props {
  context: {
    territoryId: string
    territoryNumber: string
    streetId: string
    houseId: number
  }
  open: boolean
  onClose: ()=> void
}

export function DeleteHouseDialog({ open, onClose, context }: Props) {
  const queryClient = useQueryClient()

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      await ApiClient.getInstance().mutate(`/territories/${context.territoryId}/streets/${context.streetId}/houses/${context.houseId}`, null, { method: 'DELETE' })

      const eventHandler = new TerritoryEvents(queryClient)

      eventHandler['house.deleted']({ id: context.houseId, territoryNumber: context.territoryNumber })

      toast.success('Registro removido')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={state => !state && onClose()}>
      <DialogContent className="max-w-md" asChild>
        <form onSubmit={handleSubmit}>
          {isSubmitting && <OverlayLoading />}

          <DialogHeader>
            <DialogTitle>Remover Casa</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col text-center">
            <p>Deseja realmente remover esta casa do registro?</p>
          </div>

          <DialogFooter className="mx-auto">
            <DialogClose asChild>
              <Button variant="ghost" className="uppercase">Não</Button>
            </DialogClose>
            <Button type="submit" className="bg-destructive/80 text-destructive-foreground hover:bg-destructive/90 active:bg-destructive uppercase">Sim</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
