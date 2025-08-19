import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { ErrorMessage } from '~/features/adapters/react-hook-form/error-message'
import { TextInput } from '~/features/adapters/react-hook-form/text-input'

import { Territory } from '../types'

const schema = z.object({
  number: z.string().nonempty().refine(value => (/^[0-9.]+$/).test(value), { message: 'O número deve conter apenas dígitos' }),
})

export type TerritoryFormData = z.infer<typeof schema>

export function useUpsertTerritory() {
  const getDefaultValue = (territory?: Territory) => ({
    number: territory?.number ?? '',
  } as TerritoryFormData)

  const form = useForm<TerritoryFormData>({
    defaultValues: getDefaultValue(),
    resolver: standardSchemaResolver(schema),
    mode: 'onSubmit',
    progressive: true,
  })

  const fields = (
    <div className="flex flex-col space-y-1">
      <div>
        <TextInput name="number" label="Número do território" />
        <ErrorMessage field="number" />
      </div>
    </div>
  )

  return {
    form,
    fields,
    getDefaultValue,
  }
}
