import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { delay } from '@repo/utils/delay'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { FormProvider, SubmitHandler } from 'react-hook-form'

import { ApiClient } from '~/features/api/api.client'

import { CustomDialogProps } from './types'
import { StreetFormData, useUpsertStreetForm } from '../forms/upsert-street'
import TerritoryEvents from '../territory.events'
import { Street } from '../types'

type Props = CustomDialogProps<{
  territoryId: number
  territoryNumber: string
}>

export function AddStreetDialog({ open, onClose, context }: Props) {
  const queryClient = useQueryClient()
  const {
    form,
    fields,
    getDefaultValue,
  } = useUpsertStreetForm()

  const onValidSubmit: SubmitHandler<StreetFormData> = async data => {
    const street = await ApiClient.getInstance().mutate<Street>(`territories/${context.territoryId}/streets`, data, {
      method: 'POST',
    })

    const eventHandler = new TerritoryEvents(queryClient, true)

    eventHandler['street.created']({
      ...context,
      street,
    })

    toast.success('Registro adicionado')
    onClose()
  }

  useEffect(() => {
    if (open) return

    delay(250).then(() => form.reset(getDefaultValue()))
  }, [form, getDefaultValue, open])

  return (
    <Dialog open={open} onOpenChange={state => !state && onClose()}>
      <DialogContent className="max-w-md">
        {form.formState.isSubmitting && <OverlayLoading />}

        <DialogHeader>
          <DialogTitle>Adicionar Rua</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form noValidate onSubmit={form.handleSubmit(onValidSubmit)}>
            <div className="flex flex-col mb-4">
              {fields}
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="ghost" color="muted" className="uppercase">Cancelar</Button>
              </DialogClose>
              <Button type="submit">OK</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  )
}
