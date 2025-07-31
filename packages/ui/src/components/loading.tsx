import { cn } from '@repo/ui/lib/utils'
import { ComponentProps } from 'react'
import { PropagateLoader } from 'react-spinners'

export default function Loading({ ...props }: ComponentProps<typeof PropagateLoader>) {
  return (
    <PropagateLoader
      speedMultiplier={0.75}
      color="var(--primary)"
      {...props}
      className={cn('relative flex flex-1 justify-center items-center mx-auto', props.className)}
    />
  )
}

export function OverlayLoading({ overlayProps, ...props }: ComponentProps<typeof PropagateLoader> & { overlayProps?: ComponentProps<'div'> }) {
  return (
    <div {...overlayProps} className={cn('flex absolute-fill z-10 bg-black/10 animate-in', overlayProps?.className)}>
      <Loading {...props} className={cn('m-auto', props.className)} />
    </div>
  )
}
