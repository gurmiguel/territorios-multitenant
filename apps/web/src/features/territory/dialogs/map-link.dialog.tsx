import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'
import { ExternalLinkIcon, PencilIcon } from '@repo/ui/components/ui/icons'
import { useState } from 'react'

import { EditMapLinkDialog } from './edit-map-link.dialog'
import { CustomDialogProps } from './types'

type Props = CustomDialogProps<{
  territoryId: number
  territoryNumber: string
  map: string | null
}>

export function MapLinkDialog({ open, onClose, context }: Props) {
  const [stage, setStage] = useState<'main' | 'edit'>('main')

  function handleMapOpen() {
    if (!context.map) return
    window.open(context.map, '_blank')
  }

  return (
    <>
      <Dialog open={open && stage === 'main'} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mapa do Território</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-2 mt-2 text-center">
            <Button disabled={!context.map} onClick={handleMapOpen}>
              Abrir o mapa <ExternalLinkIcon />
            </Button>

            <Button variant="ghost" color="foreground" onClick={() => setStage('edit')}>
              Alterar link <PencilIcon />
            </Button>
          </div>

          <DialogFooter className="justify-center">
            <DialogClose asChild>
              <Button variant="ghost" color="muted" className="uppercase">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditMapLinkDialog
        open={open && stage === 'edit'}
        context={context}
        onClose={() => setStage('main')}
      />
    </>
  )
}
