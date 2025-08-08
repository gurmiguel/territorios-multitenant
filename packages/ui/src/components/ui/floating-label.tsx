import { cn } from '@repo/ui/lib/utils'
import { Override } from '@repo/utils/types'
import { cva, VariantProps } from 'class-variance-authority'

const variantClasses = cva([
  'absolute left-0 top-0 text-md leading-3 text-muted-foreground origin-top-left pointer-events-none',
  'scale-65 translate-0',
  'transition-transform duration-250',
], {
  variants: {
    variant: {
      group: [
        [
          'group-data-[focus=true]:scale-65 group-data-[focus=true]:translate-0',
          'not-group-data-[placeholder]:scale-65 not-group-data-[placeholder]:translate-0',
        ],
        [
          'group-data-[focus=false]:translate-y-5 group-data-[focus=false]:translate-x-1 group-data-[focus=false]:scale-100',
          'group-data-[placeholder]:translate-y-5 group-data-[placeholder]:translate-x-1 group-data-[placeholder]:scale-100',
        ],
        'group-aria-[invalid=true]:text-destructive',
        'group-aria-[disabled=true]:opacity-50 group-aria-[disabled=true]:select-none',
      ],
      peer: [
        'peer-focus:scale-65 peer-focus:translate-0',
        'peer-placeholder-shown:translate-y-5 peer-placeholder-shown:translate-x-1 peer-placeholder-shown:scale-100',
        'peer-user-invalid:text-destructive',
        'peer-disabled:opacity-50 peer-disabled:select-none',
      ],
    },
  },
  defaultVariants: {
    variant: 'peer',
  },
})

export function FloatingLabel({ className, variant, ...props }: Override<React.ComponentProps<'span'>, VariantProps<typeof variantClasses>>) {
  return (
    <span className={cn(variantClasses({ variant, className }))} {...props}/>
  )
}
