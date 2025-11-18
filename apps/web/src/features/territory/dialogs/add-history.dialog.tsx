import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Checkbox } from '@repo/ui/components/ui/checkbox'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { PhoneIcon } from '@repo/ui/components/ui/icons'
import { toast } from '@repo/ui/components/ui/sonner'
import { formatPhoneNumber } from '@repo/utils/phone'
import { useQueryClient } from '@tanstack/react-query'
import { FormEvent, useState } from 'react'

import { ApiError } from '~/features/api/api.base'
import { ApiClient } from '~/features/api/api.client'
import { useAuth } from '~/features/auth/auth.context'

import TerritoryEvents from '../territory.events'
import { StatusUpdate } from '../types'
import { CustomDialogProps } from './types'

type Props = CustomDialogProps<{
  territoryNumber: string
  territoryId: number
  streetId: number
  houseId: number
  phones: string[]
}> & {
  onOpenDelete: ()=> void
  onOpenEdit: ()=> void
}

export function AddHistoryDialog({ open, onClose, context, onOpenDelete, onOpenEdit }: Props) {
  const queryClient = useQueryClient()
  const { can } = useAuth()

  const [isSubmitting, setIsSubmitting] = useState(false)

  async function addHistory(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setIsSubmitting(true)
    try {
      const formData = new FormData(e.currentTarget)
      const statusOk = formData.get('status-ok') === 'on'
      const statusFail = formData.get('status-fail') === 'on'

      if (statusOk || statusFail) {
        const status = await ApiClient.getInstance().mutate<StatusUpdate>(`/territories/${context.territoryId}/streets/${context.streetId}/houses/${context.houseId}/status`, {
          status: statusFail ? 'Fail' : 'OK',
          date: new Date().toISOString(),
        })

        const eventHandler = new TerritoryEvents(queryClient, true)

        eventHandler['house.status.updated']({
          houseId: context.houseId,
          streetId: context.streetId,
          territoryNumber: context.territoryNumber,
          status,
        })

        toast.success('Registro adicionado')
      }

      onClose()
    } catch (err) {
      if (err instanceof ApiError && err.status === 499)
        toast.error('Erro de conexão. Tente novamente mais tarde.')
      else {
        toast.error('Ocorreu um erro ao adicionar o registro. Por favor, tente novamente.')
        console.error(err)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const canDelete = can('houses:delete')
  const canEdit = can('houses:write')

  return (
    <Dialog open={open} onOpenChange={state => !state && onClose()}>
      <DialogContent className="max-w-3xs" asChild>
        <form onSubmit={addHistory}>
          {isSubmitting && <OverlayLoading />}

          <DialogHeader>
            <DialogTitle>Adicionar Registro</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col">
            {(canDelete || canEdit) && (
              <div className="flex gap-1 mx-auto mb-2">
                {canDelete && <Button variant="destructive" className="uppercase" onClick={onOpenDelete}>Deletar</Button>}
                {canEdit && <Button variant="ghost" className="uppercase" onClick={onOpenEdit}>Editar</Button>}
              </div>
            )}

            {context.phones.length > 0 && (
              <div className="flex flex-col gap-1 mt-1 mb-3">
                {context.phones.map((phone, i) => (
                  <a key={phone}
                    href={`tel:+55${phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-primary text-sm tracking-tighter font-mono hover:underline"
                  >
                    <PhoneIcon size={16} />
                    <div className="text-[10px] -mt-4 -ml-2 rounded-full text-primary-foreground bg-primary/90 size-4 text-center">{i + 1}</div>
                    {formatPhoneNumber(phone)}
                  </a>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-1">
              <label className="flex flex-1 justify-between items-center">
                <span className="text-md tracking-tight">Morador atendeu?</span>
                <Checkbox name="status-ok" />
              </label>
              <label className="flex flex-1 justify-between items-center">
                <span className="text-md tracking-tight">Marcar para não bater?</span>
                <Checkbox name="status-fail" />
              </label>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" color="muted" className="uppercase">Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="ghost">OK</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
