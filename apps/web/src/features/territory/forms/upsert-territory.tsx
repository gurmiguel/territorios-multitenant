import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { cn } from '@repo/ui/lib/utils'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { Checkbox } from '~/features/adapters/react-hook-form/checkbox'
import { ErrorMessage } from '~/features/adapters/react-hook-form/error-message'
import { TextInput } from '~/features/adapters/react-hook-form/text-input'

import { Territory } from '../types'

const schema = z.object({
  id: z.number().optional(),
  number: z.string().nonempty().refine(value => (/^[0-9.]+$/).test(value), { message: 'O número deve conter apenas dígitos' }),
  color: z.string().regex(/(^#([a-f0-9]{3}){1,2}$|^$)/i).optional(),
  hidden: z.boolean().optional(),
})
  .refine(v => !!v.color, {
    when: v => (v.value as TerritoryFormData).id !== undefined,
    path: ['color'],
    error: 'Campo obrigatório',
  })

export type TerritoryFormData = z.infer<typeof schema>

export function useUpsertTerritory(territory?: Partial<Territory>) {
  const getDefaultValue = (territory?: Partial<Territory>) => ({
    id: territory?.id,
    number: territory?.number ?? '',
    color: territory?.color,
    hidden: territory?.hidden,
  } as TerritoryFormData)

  const form = useForm<TerritoryFormData>({
    defaultValues: getDefaultValue(territory),
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

      <div className={cn('flex justify-between space-x-4', !territory?.id && 'hidden')}>
        <div className="flex-1">
          <TextInput name="color" label="Cor" />
          <ErrorMessage field="color" />
        </div>
        <div>
          <label className="flex items-center space-x-1 shrink-0 mt-2 -mb-1 py-2">
            <span className="text-sm">Ocultar?</span>
            <Checkbox name="hidden" />
          </label>
          <ErrorMessage field="hidden" />
        </div>
      </div>
    </div>
  )

  return {
    form,
    fields,
    getDefaultValue,
  }
}
