import { differenceInMonths, format as formatDate } from 'date-fns'
import { CheckIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '../lib/utils'

type Props = {
  hideIcon?: boolean
} & ({
  status: {
    date: string
    status: string
  }
  count?: never
} | {
  status?: never
  count: number
})

export const MONTHS_TO_EXPIRE_STATUS = 4

export function StatusUpdate({ status, count, hideIcon = false }: Props) {
  const state = useMemo(() => {
    switch (true) {
      case typeof count === 'number':
        // COUNT MODE
        if (count > 0)
          return { text: `(${count})`, color: 'text-warning' }
        else
          return { text: <CheckIcon size={18} className="-mr-0.5 text-success" strokeWidth={3} /> }

      case typeof status === 'object':
        // STATUS MODE
        const date = new Date(status.date)

        const color = status.status === 'OK'
          ? differenceInMonths(new Date(), date) >= MONTHS_TO_EXPIRE_STATUS ? 'text-warning' : 'text-success'
          : 'text-destructive'

        const text = formatDate(date, 'dd/MM/yyyy')

        return { text, color }

      default:
        console.error('Invalid parameters', { count, status })
        return null
    }
  }, [count, status])

  if (state === null) return <></>

  const { text, color } = state

  const IconComponent = status?.status === 'OK' ? CheckIcon : XIcon

  return (
    <span className={cn([
      'flex items-center gap-1 ml-auto text-sm font-semibold',
      color,
    ])}>
      {!hideIcon && <IconComponent size={12} className={cn('-mb-0.5', color)} />}
      {text}
    </span>
  )
}
