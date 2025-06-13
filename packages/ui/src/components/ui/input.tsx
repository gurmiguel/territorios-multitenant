'use client'

import { cn } from '@repo/ui/lib/utils'
import { Override } from '@repo/utils/index'
import * as React from 'react'

interface Props {
  label: string
  leftIcon?: React.ReactElement<{size?: number, className?: string}>
  rightIcon?: React.ReactElement<{size?: number, className?: string}>
}

function Input({ className, type, label, leftIcon, rightIcon, ...props }: Override<React.ComponentProps<'input'>, Props>) {
  return (
    <label className="relative flex flex-col pt-3" data-slot="label">
      <input
        type={type}
        data-slot="input"
        className={cn(
          'peer file:text-foreground placeholder-transparent selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-8 w-full min-w-0 border-b border-b-foreground bg-transparent pl-1 pr-3 py-1 text-base transition-[color] outline-none file:inline-flex file:h-7 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'focus-visible:ring-0',
          'user-invalid:border-b-destructive',
          leftIcon && 'pl-6',
          className,
        )}
        {...props}
        placeholder={props.placeholder ?? label}
      />
      {leftIcon && (
        <span className={cn([
          'absolute left-0 top-0 pt-3 h-full flex items-center pointer-events-none',
          'peer-user-invalid:text-destructive',
        ])}
        >
          {React.cloneElement(leftIcon, { className: cn(!leftIcon.props.size && 'size-4', 'text-muted-foreground text-currentColor', leftIcon.props.className) })}
        </span>
      )}
      <span className={cn([
        'absolute z-1 -bottom-0.25 left-1/2 -translate-x-1/2 w-full h-0.5 bg-foreground/80 transition-transform scale-x-0',
        'peer-focus:scale-x-100 peer-hover:scale-x-100',
        'peer-user-invalid:bg-destructive',
      ])} />
      <span
        className={cn([
          'absolute left-0 top-0 text-md leading-3 text-muted-foreground origin-top-left pointer-events-none',
          'scale-65 translate-0',
          'peer-focus:scale-65 peer-focus:translate-0',
          'peer-placeholder-shown:translate-y-5 peer-placeholder-shown:translate-x-1 peer-placeholder-shown:scale-100',
          leftIcon && 'peer-placeholder-shown:translate-x-6',
          'transition-transform duration-250',
          'peer-user-invalid:text-destructive',
        ])}
      >{label}</span>
    </label>
  )
}

export { Input }
