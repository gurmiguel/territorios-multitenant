import { ErrorMessage as UIErrorMessage } from '@repo/ui/components/error-message'
import { Override } from '@repo/utils/types'
import { ComponentProps } from 'react'
import { FieldErrors, get, useFormState } from 'react-hook-form'

interface Props {
  field: string
}

export function ErrorMessage({ field, ...props }: Override<ComponentProps<typeof UIErrorMessage>, Props>) {
  const { errors } = useFormState()

  const error = get(errors, field) as FieldErrors[string]

  if (!error) return <></>

  return <UIErrorMessage {...props}>{error.message?.toString()}</UIErrorMessage>
}
