import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { useQueryClient } from '@tanstack/react-query'
import { FormEvent, useEffect, useState } from 'react'

import { ApiClient } from '~/features/api/api.client'

import TerritoryEvents from '../territory.events'
import { CustomDialogProps } from './types'

type Props = CustomDialogProps<{
  streetName: string
  territoryId: number
  territoryNumber: string
  streetId: number
  hasHouses: boolean
}>

export function DeleteStreetDialog({ open, onClose, context }: Props) {
  const queryClient = useQueryClient()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState<'main' | 'confirm'>('main')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (context.hasHouses && currentStep === 'main')
      return setCurrentStep('confirm')

    setIsSubmitting(true)
    try {
      await ApiClient.getInstance().mutate(`/territories/${context.territoryId}/streets/${context.streetId}`, null, { method: 'DELETE' })

      const eventHandler = new TerritoryEvents(queryClient, true)

      eventHandler['street.deleted']({ id: context.streetId, territoryNumber: context.territoryNumber })

      toast.success('Registro removido')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (!open) return
    return () => setCurrentStep('main')
  }, [open])

  return (
    <>
      <Dialog open={open && currentStep === 'main'} onOpenChange={state => !state && onClose()}>
        <DialogContent className="max-w-md" asChild>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Remover Rua</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col text-center">
              <p>Deseja realmente remover <strong>&ldquo;{context.streetName}&rdquo;</strong> do registro?</p>
            </div>

            <DialogFooter className="mx-auto">
              <DialogClose asChild>
                <Button variant="ghost" color="muted" className="uppercase">Não</Button>
              </DialogClose>
              <Button type="submit" className="bg-destructive/80 accessible-text-destructive-foreground hover:bg-destructive/90 active:bg-destructive uppercase">Sim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={open && currentStep === 'confirm'} onOpenChange={state => !state && onClose()}>
        <DialogContent className="max-w-md" asChild>
          <form onSubmit={handleSubmit}>
            {isSubmitting && <OverlayLoading />}

            <DialogHeader>
              <DialogTitle>Remover Rua</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col text-center">
              <p>Ainda existem casas cadastradas nesta rua, deseja realmente remover a rua junto com as casas e seus registros?</p>
            </div>

            <DialogFooter className="mx-auto">
              <DialogClose asChild>
                <Button variant="ghost" color="muted" className="uppercase">Não</Button>
              </DialogClose>
              <Button type="submit" className="bg-destructive/80 accessible-text-destructive-foreground hover:bg-destructive/90 active:bg-destructive uppercase">Sim</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
