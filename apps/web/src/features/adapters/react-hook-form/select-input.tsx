import { Select, SelectTrigger } from '@repo/ui/components/ui/select'
import { Override } from '@repo/utils/types'
import { Children, cloneElement, ComponentProps, ComponentPropsWithRef, isValidElement, ReactElement } from 'react'
import { Controller, get, RegisterOptions, useFormContext } from 'react-hook-form'

interface Props extends Omit<ComponentProps<typeof Controller>, 'control' | 'render'> {
  name: string
  registerOptions?: RegisterOptions
}

export function SelectInput({ registerOptions, children, ...props }: Override<ComponentPropsWithRef<typeof Select>, Props>) {
  const { formState: { defaultValues, isSubmitted }, trigger } = useFormContext()

  return (
    <Controller
      name={props.name}
      render={({ field, fieldState }) => (
        <Select
          {...props}
          {...field}
          defaultValue={field.value}
          onValueChange={value => {
            try {
              field.onChange(value)
              isSubmitted && trigger()
            } finally {
              props.onValueChange?.(value)
            }
          }}
        >
          {Children.map(children, child => isValidElement(child) && child.type === SelectTrigger
            ? cloneElement(child as ReactElement<{errored: boolean}>, { errored: fieldState.invalid })
            : child)}
        </Select>
      )}
      defaultValue={get(defaultValues, props.name)}
      disabled={props.disabled}
      shouldUnregister={props.shouldUnregister}
    />
  )
}
