import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Button } from '@repo/ui/components/ui/button'
import { DeleteIcon, PhoneIcon } from '@repo/ui/components/ui/icons'
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui/components/ui/select'
import { cn } from '@repo/ui/lib/utils'
import { delay } from '@repo/utils/delay'
import { HouseTypes } from '@repo/utils/types'
import { useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import z from 'zod'

import { Checkbox } from '~/features/adapters/react-hook-form/checkbox'
import { ErrorMessage } from '~/features/adapters/react-hook-form/error-message'
import { SelectInput } from '~/features/adapters/react-hook-form/select-input'
import { TextInput } from '~/features/adapters/react-hook-form/text-input'

import { House } from '../types'

const schema = z.object({
  number: z.string().regex(/(\d)*/i, 'Somente números').optional(),
  noNumber: z.boolean(),
  type: z.enum(HouseTypes),
  complement: z.string(),
  phones: z.array(z.object({
    number: z.string().min(1).regex(/\d{2} 9?\d{4}\-\d{4}/),
  })),
  observation: z.string(),
})
  .refine(s => s.noNumber || s.number, {
    message: 'Campo obrigatório',
    path: ['number'],
    when: () => true,
  })
  .refine(s => s.noNumber && !!s.observation.length, {
    message: 'Para casas sem número, adicione uma observação para facilitar a localização',
    path: ['observation'],
    when: ({ value }) => schema.pick({ noNumber: true }).safeParse(value).data?.noNumber === true,
  })
  .refine(s => !!s.complement.length, {
    message: 'Complemento é obrigatório para este tipo',
    path: ['complement'],
    when: ({ value }) => [HouseTypes.Apartamento, HouseTypes.Comercio, HouseTypes.Empresa]
      .includes(schema.pick({ type: true }).safeParse(value).data?.type as HouseTypes),
  })

export type HouseFormData = z.infer<typeof schema>

export function useUpsertHouseForm(house?: House) {
  const getDefaultValue = (house?: House) => ({
    number: house?.number ?? '',
    noNumber: house?.number === 'S/N',
    type: house?.type ?? HouseTypes.Casa,
    complement: house?.complement ?? '',
    phones: house?.phones.map(p => ({ number: p.replace(/(\d{2})(9?\d{4})(\d{4})/, '$1 $2-$3') })) ?? [],
    observation: house?.observation ?? '',
  } as HouseFormData)

  const form = useForm<HouseFormData>({
    defaultValues: getDefaultValue(house),
    resolver: standardSchemaResolver(schema),
    mode: 'onSubmit',
    progressive: true,
  })

  const lastNumber = useRef(house?.number ?? '')

  const { append, fields: phones, remove } = useFieldArray({
    control: form.control,
    name: 'phones',
  })

  function handleAddPhone() {
    append({ number: '' }, { shouldFocus: true })
  }

  const fields = (
    <div className="flex flex-col space-y-1">
      <div className="flex justify-between items-start space-x-2">
        <label className="block flex-1">
          <TextInput name="number" inputMode="numeric"
            label="N° da casa" registerOptions={{ deps: ['noNumber'] }}
            disabled={form.watch('noNumber')} />
          <ErrorMessage field="number" />
        </label>
        <label className="flex items-center space-x-1 shrink-0 mt-2 -mb-1 py-2">
          <span className="text-sm">Sem número</span>
          <Checkbox name="noNumber" onCheckedChange={checked => {
            if (checked) {
              lastNumber.current = form.getValues('number') ?? ''
              form.setValue('number', 'S/N')
            } else {
              form.setValue('number', lastNumber.current)
              delay(100).then(() => form.setFocus('number'))
            }
          }} />
        </label>
      </div>
      <div>
        <SelectInput name="type">
          <SelectTrigger>
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HouseTypes.Casa}>{HouseTypes.Casa}</SelectItem>
            <SelectItem value={HouseTypes.Apartamento}>{HouseTypes.Apartamento}</SelectItem>
            <SelectItem value={HouseTypes.Comercio}>{HouseTypes.Comercio}</SelectItem>
            <SelectItem value={HouseTypes.Empresa}>{HouseTypes.Empresa}</SelectItem>
          </SelectContent>
        </SelectInput>
        <ErrorMessage field="type" />
      </div>
      <div>
        <TextInput name="complement" label="Complemento" />
        <ErrorMessage field="complement" />
      </div>
      <fieldset className={cn('flex flex-col mt-1.5 -mx-2 p-2 border border-muted-foreground', !phones.length && 'pt-0')}>
        <legend className="text-xs px-2">Telefones</legend>
        {phones.map(({ id }, i) => (
          <div key={id} className="-mt-1.5 mb-2">
            <div className="flex items-center space-x-1">
              <TextInput name={`phones.${i}.number`}
                inputMode="tel"
                wrapperClassName="flex-1"
                label="Telefone"
                leftIcon={<PhoneIcon />} />
              <Button variant="ghost" size="icon"
                color="destructive" className="rounded-full p-0 size-9"
                onClick={() => remove(i)}
              >
                <DeleteIcon className="size-4" />
              </Button>
            </div>
            <ErrorMessage field={`phones.${i}.number`} />
          </div>
        ))}
        <div className="flex items-center">
          {phones.length === 0 && <span className="flex-1 mr-2 text-sm text-muted-foreground italic text-center">Sem telefones</span>}
          <Button variant="outline" className="ml-auto uppercase text-xs" onClick={handleAddPhone}>Adicionar Telefone</Button>
        </div>
      </fieldset>
      <div>
        <TextInput name="observation" inputMode="text" registerOptions={{ deps: ['number', 'noNumber'] }} label="Observações" />
        <ErrorMessage field="observation" />
      </div>
    </div>
  )

  return {
    form,
    fields,
    getDefaultValue,
  }
}
