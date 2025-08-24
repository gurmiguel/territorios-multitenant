import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { ErrorMessage } from '~/features/adapters/react-hook-form/error-message'
import { TextInput } from '~/features/adapters/react-hook-form/text-input'

import { Territory } from '../types'

const schema = z.object({
  map: z.string().refine(v => v.startsWith('http'), {
    error: 'URL inválida',
    when: ({ value }) => typeof value === 'string' && value.length > 0,
  }),
})

export type UpdateMapFormData = z.infer<typeof schema>

export function useUpdateMap(data?: Pick<Territory, 'map'>) {
  const getDefaultValue = (data?: Pick<Territory, 'map'>) => ({
    map: data?.map ?? '',
  } as UpdateMapFormData)

  const form = useForm<UpdateMapFormData>({
    defaultValues: getDefaultValue(data),
    resolver: standardSchemaResolver(schema),
    mode: 'onSubmit',
    progressive: true,
  })

  const fields = (
    <div className="flex flex-col space-y-1">
      <div>
        <TextInput name="map" label="Mapa" />
        <ErrorMessage field="map" />
      </div>
    </div>
  )

  return {
    form,
    getDefaultValue,
    fields,
  }
}
