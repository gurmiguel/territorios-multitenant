import { Input } from '@repo/ui/components/ui/input'
import { Override } from '@repo/utils/types'
import { ComponentPropsWithRef } from 'react'
import { get, RegisterOptions, useFormContext, useFormState } from 'react-hook-form'

interface Props {
  name: string
  registerOptions?: RegisterOptions
}

export function TextInput({ registerOptions, ...props }: Override<ComponentPropsWithRef<typeof Input>, Props>) {
  const { register } = useFormContext()
  const { errors } = useFormState()

  const error = get(errors, props.name)

  return <Input {...props} {...register(props.name, registerOptions)} errored={!!error} />
}
