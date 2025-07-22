import { differenceInMonths, format as formatDate } from 'date-fns'
import { CheckIcon, XIcon } from 'lucide-react'

import { cn } from '../lib/utils'

interface Props {
  hideIcon?: boolean
  status: {
    date: string
    status: string
  }
}

export function StatusUpdate({ status, hideIcon = false }: Props) {
  const date = new Date(status.date)

  const IconComponent = status.status === 'OK' ? CheckIcon : XIcon

  const color = status.status === 'OK'
    ? differenceInMonths(new Date(), date) >= 4 ? 'text-warning' : 'text-success'
    : 'text-destructive'

  return (
    <span className={cn([
      'flex items-center gap-1 ml-auto text-sm font-semibold',
      color,
    ])}>
      {!hideIcon && <IconComponent size={12} className={cn('-mb-0.5', color)} />}
      {formatDate(date, 'dd/MM/yyyy')}
    </span>
  )
}
