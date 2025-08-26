import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { generateHexColor } from '@repo/utils/colors'
import { delay } from '@repo/utils/delay'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { FormProvider, SubmitHandler } from 'react-hook-form'

import { ApiClient } from '~/features/api/api.client'

import { CustomDialogProps } from './types'
import { TerritoryFormData, useUpsertTerritory } from '../forms/upsert-territory'
import TerritoryEvents from '../territory.events'
import { Territory } from '../types'

type Props = CustomDialogProps

export function AddTerritoryDialog({ open, onClose }: Props) {
  const queryClient = useQueryClient()
  const {
    form,
    fields,
    getDefaultValue,
  } = useUpsertTerritory()

  const onValidSubmit: SubmitHandler<TerritoryFormData> = async data => {
    const territory = await ApiClient.getInstance().mutate<Territory>('territories', {
      number: data.number,
      color: generateHexColor(Number(data.number)),
      hidden: false,
      map: null,
    }, {
      method: 'POST',
    })

    const eventHandler = new TerritoryEvents(queryClient, true)

    eventHandler['territory.created']({
      territory,
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
          <DialogTitle>Adicionar Território</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onValidSubmit)}>
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
