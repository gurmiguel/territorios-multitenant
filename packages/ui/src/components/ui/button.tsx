import { Slot } from '@radix-ui/react-slot'
import { cn } from '@repo/ui/lib/utils'
import { Override } from '@repo/utils/types'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-primary accessible-text-primary-foreground shadow-xs hover:bg-primary/90',
        outline:
          'border border-foreground bg-background shadow-xs hover:bg-accent-foreground/10 active:bg-accent-foreground/20 dark:hover:bg-accent accessible-text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary accessible-text-secondary-foreground shadow-xs hover:bg-secondary/80',
        ghost:
          'accessible-text-primary hover:bg-accent-foreground/10 active:bg-accent-foreground/20 dark:hover:bg-accent/50',
        destructive:
          'accessible-text-destructive hover:bg-accent-foreground/10 active:bg-accent-foreground/20 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      color: {
        primary: 'accessible-text-primary',
        secondary: 'accessible-text-secondary',
        muted: 'accessible-text-muted-foreground',
        accent: 'accessible-text-accent-foreground',
        destructive: 'accessible-text-destructive',
        warning: 'accessible-text-warning',
        success: 'accessible-text-success',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  color,
  asChild = false,
  type = 'button',
  ...props
}: Override<React.ComponentProps<'button'>, VariantProps<typeof buttonVariants> & { asChild?: boolean }>) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      type={type}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, color, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
