import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { FormEvent } from 'react'

import { House } from '../types'

interface Props {
  context: {
    territoryId: string
    territoryNumber: string
    streetId: string
    house: House
  }
  open: boolean
  onClose: ()=> void
}

async function handleSubmit(e: FormEvent<HTMLFormElement>) {

}

export function EditHouseDialog({ open, onClose, context }: Props) {
  return (
    <Dialog open={open} onOpenChange={state => !state && onClose()}>
      <DialogContent className="max-w-md" asChild>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Atualizar Casa</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col">
            FORM
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" className="uppercase">Cancelar</Button>
            </DialogClose>
            <Button type="submit">OK</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
