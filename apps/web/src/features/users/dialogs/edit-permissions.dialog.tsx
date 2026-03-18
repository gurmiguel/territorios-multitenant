import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { toast } from '@repo/ui/components/ui/sonner'
import { delay } from '@repo/utils/delay'
import { useEffect, useState, useTransition } from 'react'
import { FormProvider, SubmitHandler } from 'react-hook-form'

import { ApiClient } from '~/features/api/api.client'
import { useAuth } from '~/features/auth/auth.context'

import { CustomDialogProps } from './types'
import { deleteUser } from '../actions/delete-user.action'
import { savePermissions } from '../actions/save-permissions.action'
import { PermissionsFormData, useEditPermissionsForm } from '../forms/edit-permissions'

type Props = CustomDialogProps<{
  id: string
  permissions: string[]
}>

export function EditPermissionsDialog({ open, onClose, context }: Props) {
  const { can, login, state: { user } } = useAuth()

  const [isDeleting, setIsDeleting] = useState(false)
  const [pendingDelete, startDeleteTransition] = useTransition()

  const {
    fields,
    form,
    getDefaultValue,
  } = useEditPermissionsForm(context)

  const onValidSubmit: SubmitHandler<PermissionsFormData> = data => {
    startDeleteTransition(async () => {
      try {
        await savePermissions(context.id, data.permissions)

        toast.success('Permissões alteradas')
        onClose()

        if (context.id === user?.id) {
          const [{ accessToken, user }] = await Promise.all([
            ApiClient.getInstance().getAccessToken(true),
            delay(500),
          ])

          login(accessToken, user)
        }
      } catch {
        toast.error('Erro ao salvar novas permissões')
      }
    })
  }

  async function handleRemoveUser() {
    try {
      await deleteUser(context.id)

      toast.success('Usuário removido com sucesso')
      onClose()
    } catch {
      toast.error('Não foi possível remover o usuário')
    }
  }

  useEffect(() => {
    if (open) return

    delay(250).then(() => form.reset(getDefaultValue(context.permissions)))
  }, [context.permissions, form, getDefaultValue, open])

  return (
    <Dialog open={open} onOpenChange={state => !state && onClose()}>
      <DialogContent className="max-w-md">
        {form.formState.isSubmitting && <OverlayLoading />}

        <DialogHeader>
          <DialogTitle>Atualizar Permissões</DialogTitle>
        </DialogHeader>

        <FormProvider {...form}>
          <form noValidate onSubmit={form.handleSubmit(onValidSubmit)}>
            <div className="flex flex-col mb-4">
              {fields}
            </div>

            <DialogFooter>
              <div className="ml-0 mr-auto">
                {can('safe', 'users:delete') && <Button variant="ghost" color="destructive" className="uppercase" onClick={() => setIsDeleting(true)}>Remover Usuário</Button>}
              </div>

              <DialogClose asChild>
                <Button variant="ghost" color="muted" className="uppercase">Cancelar</Button>
              </DialogClose>
              <Button type="submit">OK</Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>

      <Dialog open={isDeleting} onOpenChange={state => !state && setIsDeleting(false)}>
        <DialogContent className="max-w-md" asChild>
          <form onSubmit={handleRemoveUser}>
            {pendingDelete && <OverlayLoading />}

            <DialogHeader>
              <DialogTitle>Remover Usuário</DialogTitle>
            </DialogHeader>

            <div className="flex flex-col text-center">
              <p>
                Deseja realmente remover este usuário?<br/>
                <strong className="text-lg font-semibold">Esta ação não pode ser desfeita.</strong>
              </p>
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
    </Dialog>
  )
}
