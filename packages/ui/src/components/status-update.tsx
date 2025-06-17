import { differenceInMonths, format as formatDate } from 'date-fns'

import { cn } from '../lib/utils'

interface Props {
  status: {
    date: string
    status: string
  }
}

export function StatusUpdate({ status }: Props) {
  const date = new Date(status.date)
  return (
    <span className={cn([
      'ml-auto text-sm font-semibold',
      status.status === 'OK' ? [
        differenceInMonths(new Date(), date) >= 4 ? 'text-warning' : 'text-success',
      ] : [
        'text-destructive',
      ],
    ])}>{formatDate(date, 'dd/MM/yyyy')}</span>
  )
}
