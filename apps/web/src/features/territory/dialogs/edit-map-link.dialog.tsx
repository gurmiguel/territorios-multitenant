import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { delay } from '@repo/utils/delay'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { FormProvider, SubmitHandler } from 'react-hook-form'

import { ApiClient } from '~/features/api/api.client'

import { UpdateMapFormData, useUpdateMapLink } from '../forms/update-map-link'
import TerritoryEvents from '../territory.events'
import { Territory } from '../types'
import { CustomDialogProps } from './types'

type Props = CustomDialogProps<{
  territoryNumber: string
  territoryId: number
  map: string | null
}>

export function EditMapLinkDialog({ open, onClose, context }: Props) {
  const queryClient = useQueryClient()
  const {
    form,
    fields,
    getDefaultValue,
  } = useUpdateMapLink({ map: context.map })

  const onValidSubmit: SubmitHandler<UpdateMapFormData> = async data => {
    const territory = await ApiClient.getInstance().mutate<Territory>(`territories/${context.territoryId}`, data, {
      method: 'PATCH',
    })

    const eventHandler = new TerritoryEvents(queryClient, true)

    eventHandler['territory.updated']({
      ...context,
      territory,
    })

    toast.success('Registro alterado')
    onClose()
  }

  useEffect(() => {
    if (open) return

    delay(250).then(() => form.reset(getDefaultValue({ map: context.map })))
  }, [context.map, form, getDefaultValue, open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {form.formState.isSubmitting && <OverlayLoading />}

        <DialogHeader>
          <DialogTitle>Atualizar Mapa</DialogTitle>
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
