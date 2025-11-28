import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { delay } from '@repo/utils/delay'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler, useFormContext } from 'react-hook-form'

import { ApiClient } from '~/features/api/api.client'

import { UpdateImageFormData, useUpdateImage } from '../forms/update-image'
import TerritoryEvents from '../territory.events'
import { Territory } from '../types'
import { CustomDialogProps } from './types'

type Props = CustomDialogProps<{
  territoryId: number
  territoryNumber: string
  imageUrl: string | null
}>

export function EditImageDialog({ open, onClose, context }: Props) {
  const queryClient = useQueryClient()

  const {
    form,
    fields,
    getDefaultValue,
  } = useUpdateImage()

  const [currentStep, setCurrentStep] = useState<'main' | 'delete'>('main')

  const onValidSubmit: SubmitHandler<UpdateImageFormData> = async data => {
    if (!data.image) return onClose()

    const formData = new FormData()
    formData.append('file', data.image)
    const { publicUrl } = await ApiClient.getInstance().mutate<{publicUrl: string}>(`assets/territory/${context.territoryId}`, formData, {
      method: 'POST',
    })

    const eventHandler = new TerritoryEvents(queryClient, true)

    eventHandler['territory.updated']({
      ...context,
      territory: {
        id: context.territoryId,
        number: context.territoryNumber,
        imageUrl: publicUrl,
      },
    })

    toast.success('Imagem alterada')
    onClose()
  }

  async function handleRemoveImage() {
    const image = form.getValues('image')
    if (image) {
      form.resetField('image')
      return
    }

    if (currentStep === 'main')
      return setCurrentStep('delete')

    const territory = await ApiClient.getInstance().mutate<Territory>(`territories/${context.territoryId}`, { removeImage: true }, {
      method: 'PATCH',
    })

    const eventHandler = new TerritoryEvents(queryClient, true)

    eventHandler['territory.updated']({
      ...context,
      territory: {
        ...territory,
        imageUrl: null,
      },
    })

    toast.success('Imagem removida')
    onClose()
  }

  useEffect(() => {
    if (open) return

    delay(250).then(() => {
      form.reset(getDefaultValue())
      setCurrentStep('main')
    })
  }, [form, getDefaultValue, open])

  return (
    <>
      <Dialog open={open && currentStep === 'main'} onOpenChange={state => !state && onClose()}>
        <DialogContent className="max-w-md">
          {form.formState.isSubmitting && <OverlayLoading />}

          <DialogHeader>
            <DialogTitle>Alterar imagem</DialogTitle>
          </DialogHeader>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onValidSubmit)}>
              <div className="flex flex-col mb-4">
                {fields}
              </div>

              <DialogFooter>
                {!!context.imageUrl && (
                  <RemoveImageButton variant="ghost"
                    className="ml-0 mr-auto uppercase"
                    onClick={handleRemoveImage}>Remover Imagem</RemoveImageButton>
                )}

                <DialogClose asChild>
                  <Button variant="ghost" color="muted" className="uppercase">Cancelar</Button>
                </DialogClose>
                <Button type="submit">OK</Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      <Dialog open={open && currentStep === 'delete'} onOpenChange={state => !state && setCurrentStep('main')}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remover imagem</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col text-center">
            <p>Deseja realmente remover a imagem deste registro?</p>
          </div>

          <DialogFooter className="justify-center">
            <DialogClose asChild>
              <Button variant="ghost" color="muted" className="uppercase">Não</Button>
            </DialogClose>
            <Button type="submit" className="uppercase" onClick={handleRemoveImage}>Sim</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RemoveImageButton(props: Omit<React.ComponentProps<typeof Button>, 'color'>) {
  const { watch } = useFormContext<UpdateImageFormData>()

  const image = watch('image')

  return <Button {...props} color={image ? 'foreground' : 'destructive'} />
}
