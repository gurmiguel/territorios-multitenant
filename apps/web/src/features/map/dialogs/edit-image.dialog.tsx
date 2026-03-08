import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { delay } from '@repo/utils/delay'
import { useEffect, useState } from 'react'
import { FormProvider, SubmitHandler } from 'react-hook-form'

import { ApiClient } from '~/features/api/api.client'
import { getTenantFromHost } from '~/features/api/utils'
import { updateCache } from '~/features/api/utils.server'

import { CustomDialogProps } from './types'
import { UpdateImageFormData, useUpdateImage } from '../forms/update-image'

type Props = CustomDialogProps<{
  imageUrl?: string
}>

export function EditImageDialog({ open, onClose }: Props) {
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
    await ApiClient.getInstance().mutate<{publicUrl: string}>('assets/map', formData, {
      method: 'POST',
    })

    await updateCache(`map/${getTenantFromHost(window.location.host)}`)

    toast.success('Imagem alterada')
    onClose()
  }

  async function handleRemoveImage() {
    //   const image = form.getValues('image')
    //   if (image) {
    //     form.resetField('image')
    //     return
    //   }

    //   if (currentStep === 'main')
    //     return setCurrentStep('delete')

    //   await ApiClient.getInstance().mutate(`territories/${context.territoryId}`, { removeImage: true }, {
    //     method: 'PATCH',
    //   })

    //   toast.success('Imagem removida')
    //   onClose()
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
            <form noValidate onSubmit={form.handleSubmit(onValidSubmit)}>
              <div className="flex flex-col mb-4">
                {fields}
              </div>

              <DialogFooter>
                {/* {(!!context.imageUrl || !!currentImage) && (
                  <RemoveImageButton variant="ghost"
                    className="ml-0 mr-auto uppercase"
                    onClick={handleRemoveImage}>Remover Imagem</RemoveImageButton>
                )} */}

                <div className="flex gap-[inherit]">
                  <DialogClose asChild>
                    <Button variant="ghost" color="muted" className="uppercase">Cancelar</Button>
                  </DialogClose>
                  <Button type="submit">OK</Button>
                </div>
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

// function RemoveImageButton(props: Omit<React.ComponentProps<typeof Button>, 'color'>) {
//   const { control } = useFormContext<UpdateImageFormData>()

//   const image = useWatch({ control, name: 'image' })

//   return <Button {...props} color={image ? 'foreground' : 'destructive'} />
// }
