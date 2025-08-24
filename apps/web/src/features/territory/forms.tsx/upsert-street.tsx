import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { ErrorMessage } from '~/features/adapters/react-hook-form/error-message'
import { TextInput } from '~/features/adapters/react-hook-form/text-input'

import { Street } from '../types'

const schema = z.object({
  name: z.string().nonempty(),
})

export type StreetFormData = z.infer<typeof schema>

export function useUpsertStreetForm(street?: Street) {
  const getDefaultValue = (street?: Street) => ({
    name: street?.name ?? '',
  } as StreetFormData)

  const form = useForm<StreetFormData>({
    defaultValues: getDefaultValue(street),
    resolver: standardSchemaResolver(schema),
    mode: 'onSubmit',
    progressive: true,
  })

  const fields = (
    <div className="flex flex-col space-y-1">
      <div>
        <TextInput name="name" label="Nome da rua" />
        <ErrorMessage field="name" />
      </div>
    </div>
  )

  return {
    form,
    fields,
    getDefaultValue,
  }
}
