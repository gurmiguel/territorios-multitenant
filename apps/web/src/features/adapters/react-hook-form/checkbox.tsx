import { Checkbox as UICheckbox } from '@repo/ui/components/ui/checkbox'
import { Override } from '@repo/utils/types'
import { ComponentProps, ComponentPropsWithRef } from 'react'
import { Controller, get, useFormContext } from 'react-hook-form'

interface Props extends Omit<ComponentProps<typeof Controller>, 'control' | 'render'> {
  value?: boolean | string
}

export function Checkbox({ value = true, ...props }: Override<ComponentPropsWithRef<typeof UICheckbox>, Props>) {
  const { formState: { defaultValues, isSubmitted }, trigger } = useFormContext()

  const uncheckedValue = typeof value === 'boolean' ? !value : undefined

  return (
    <Controller
      name={props.name}
      render={({ field }) => (
        <UICheckbox
          {...props}
          {...field}
          checked={field.value}
          onCheckedChange={checked => {
            try {
              field.onChange(checked ? value : uncheckedValue)
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
