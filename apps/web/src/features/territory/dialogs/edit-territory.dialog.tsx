import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { delay } from '@repo/utils/delay'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler } from 'react-hook-form'

import { ApiClient } from '~/features/api/api.client'

import { CustomDialogProps } from './types'
import { TerritoryFormData, useUpsertTerritory } from '../forms/upsert-territory'
import TerritoryEvents from '../territory.events'
import { Territory } from '../types'

type Props = CustomDialogProps<{
  territory: Territory
}>

export function EditTerritoryDialog({ open, onClose, context }: Props) {
  const queryClient = useQueryClient()
  const {
    form,
    fields,
    getDefaultValue,
  } = useUpsertTerritory(context.territory)

  const [openDialog, setOpenDialog] = useState<'main' | 'remove'>('main')

  const onValidSubmit: SubmitHandler<TerritoryFormData> = async data => {
    const territory = await ApiClient.getInstance().mutate<Territory>(`territories/${context.territory.id}`, {
      number: data.number,
      color: data.color,
      hidden: data.hidden ?? false,
    }, {
      method: 'PATCH',
    })

    const eventHandler = new TerritoryEvents(queryClient, true)

    eventHandler['territory.updated']({
      territory,
    })

    toast.success('Registro alterado')
    onClose()
  }

  async function handleRemoveTerritory() {
    if (openDialog === 'main') return setOpenDialog('remove')

    await ApiClient.getInstance().mutate(`/territories/${context.territory.id}`, null, { method: 'DELETE' })

    const eventHandler = new TerritoryEvents(queryClient, true)

    eventHandler['territory.deleted']({
      territoryId: context.territory.id,
    })

    toast.success('Registro removido')
    onClose()
  }

  useEffect(() => {
    if (open) return

    delay(250).then(() => {
      form.reset(getDefaultValue(context.territory))
      setOpenDialog('main')
    })
  }, [context.territory, form, getDefaultValue, open])

  return (
    <>
      <Dialog open={open && openDialog === 'main'} onOpenChange={state => !state && onClose()}>
        <DialogContent className="max-w-md">
          {form.formState.isSubmitting && <OverlayLoading />}

          <DialogHeader>
            <DialogTitle>Editar Território</DialogTitle>
          </DialogHeader>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onValidSubmit)}>
              <div className="flex flex-col mb-4">
                {fields}
              </div>

              <DialogFooter>
                <Button variant="ghost"
                  color="destructive"
                  className="ml-0 mr-auto uppercase"
                  onClick={handleRemoveTerritory}>Remover</Button>

                <DialogClose asChild>
                  <Button variant="ghost" color="muted" className="uppercase">Cancelar</Button>
                </DialogClose>
                <Button type="submit">OK</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={open && openDialog === 'remove'} onOpenChange={state => !state && setOpenDialog('main')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remover Território</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col text-center">
            <p>Deseja realmente remover o <strong className="inline-block">Território {context.territory.number}</strong>?</p>
          </div>

          <DialogFooter className="justify-center">
            <DialogClose asChild>
              <Button variant="ghost" color="muted" className="uppercase">Não</Button>
            </DialogClose>
            <Button type="submit" className="uppercase" onClick={handleRemoveTerritory}>Sim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
