import { Checkbox as UICheckbox } from '@repo/ui/components/ui/checkbox'
import { cn } from '@repo/ui/lib/utils'
import { Override } from '@repo/utils/types'
import { ComponentProps, ComponentPropsWithRef } from 'react'
import { Controller, get, useFormContext } from 'react-hook-form'

interface Props extends Omit<ComponentProps<typeof Controller>, 'control' | 'render'> {
  value?: boolean | string
}

export function Checkbox({ value = true, ...props }: Override<ComponentPropsWithRef<typeof UICheckbox>, Props>) {
  const { formState: { defaultValues, isSubmitted }, trigger } = useFormContext()

  const isBooleanCheck = typeof value === 'boolean'
  const uncheckedValue = isBooleanCheck ? !value : undefined

  return (
    <Controller
      name={props.name}
      render={({ field: { value: fieldValue, ...field } }) => (
        <UICheckbox
          {...props}
          {...field}
          className={cn('peer', props.className)}
          checked={isBooleanCheck ? fieldValue : (fieldValue as string[]).includes(value)}
          onCheckedChange={checked => {
            try {
              if (isBooleanCheck) {
                field.onChange(checked ? value : uncheckedValue)
              } else {
                field.onChange(checked ? [...fieldValue, value] : fieldValue.filter((v: string) => v !== value))
              }
              field.onBlur()
              isSubmitted && trigger()
            } finally {
              props.onCheckedChange?.(checked)
            }
          }}
        />
      )}
      defaultValue={get(defaultValues, props.name)}
      disabled={props.disabled}
      shouldUnregister={props.shouldUnregister}
    />
  )
}
