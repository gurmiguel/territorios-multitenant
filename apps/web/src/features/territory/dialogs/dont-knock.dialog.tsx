import { Button } from '@repo/ui/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@repo/ui/components/ui/dialog'

import { CustomDialogProps } from './types'

type Props = CustomDialogProps<{
  data: {
    street: string;
    houses: string[];
  }[]
}>

export function DontKnockWarningDialog({ open, onClose, context: { data } }: Props) {
  return (
    <Dialog open={open} onOpenChange={state => !state && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atenção - Não Tocar</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col">
          Não tocar nas casas:

          <hr className="divider" />

          <div className="">
            {data.map((s, i) => (
              <div key={i} className="">
                <strong className="font-semibold">{s.street}</strong><br/>
                <strong className="font-semibold text-red-600">{s.houses.join(', ')}</strong>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="justify-center">
          <DialogClose asChild>
            <Button variant="ghost" className="uppercase">OK</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
