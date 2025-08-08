import { ComponentProps, PropsWithChildren } from 'react'

import { cn } from '../lib/utils'

export function ErrorMessage({ children, ...props }: PropsWithChildren<ComponentProps<'p'>>) {
  return (
    <p {...props} className={cn('mt-1 mb-0 text-destructive text-sm leading-3.5 text-right', props.className)}>{children}</p>
  )
}
