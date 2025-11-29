'use client'

import { cn } from '@repo/ui/lib/utils'

import { Override } from '@repo/utils/index'
import * as React from 'react'
import { useLayoutEffect, useRef } from 'react'

import { FloatingLabel } from './floating-label'
import { useMergeRefs } from '../../hooks/useMergeRefs'

interface Props {
  wrapperClassName?: string
  label: string
  leftIcon?: React.ReactElement<{size?: number, className?: string}>
  rightIcon?: React.ReactElement<{size?: number, className?: string}>
  errored?: boolean
}

function Input({ className, wrapperClassName, type, label, leftIcon, rightIcon, errored, ref, children, ...props }: Override<React.ComponentProps<'input'>, Props>) {
  const input = useRef<HTMLInputElement>(null)

  useLayoutEffect(() => {
    if (!input.current) return
    // trigger default html5 validity control without popover message
    input.current.setCustomValidity(errored ? ' ' : '')
  }, [errored])

  return (
    <label className={cn('relative flex flex-col pt-3', wrapperClassName)} data-slot="label">
      <input
        ref={useMergeRefs(input, ref)}
        type={type}
        data-slot="input"
        className={cn(
          'peer file:text-foreground placeholder-transparent selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-8 w-full min-w-0 border-b border-b-foreground bg-transparent pl-1 pr-3 py-1 text-base transition-[color] outline-none file:inline-flex file:h-7 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 disabled:select-none md:text-sm',
          'focus-visible:ring-0',
          'user-invalid:border-b-destructive',
          leftIcon && 'pl-6',
          className,
        )}
        id={props.name}
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
        'peer-disabled:scale-x-0',
      ])} />
      <FloatingLabel className={cn(leftIcon && 'peer-placeholder-shown:translate-x-6')}>{label}</FloatingLabel>

      {children}
    </label>
  )
}

export { Input }
