import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { useForm } from 'react-hook-form'
import z from 'zod'

import { ErrorMessage } from '~/features/adapters/react-hook-form/error-message'
import { ImageInput } from '~/features/adapters/react-hook-form/image-input'

const schema = z.object({
  image: z.file().mime(['image/jpeg', 'image/png']).optional(),
})

const mimeTypes = schema.shape.image
  .def.innerType
  .def.checks?.find((it): it is any => it._zod.def.check === 'mime_type')?._zod.def.mime as string[] ?? []

export type UpdateImageFormData = z.infer<typeof schema>

export function useUpdateImage() {
  const getDefaultValue = () => ({
    image: undefined,
  } as UpdateImageFormData)

  const form = useForm<UpdateImageFormData>({
    defaultValues: getDefaultValue(),
    resolver: standardSchemaResolver(schema),
    mode: 'onSubmit',
    progressive: true,
  })

  const fields = (
    <div className="flex flex-col space-y-1">
      <div>
        <ImageInput name="image" label="Imagem" accept={mimeTypes.join(', ')} />
        <ErrorMessage field="image" />
      </div>
    </div>
  )

  return {
    form,
    getDefaultValue,
    fields,
  }
}
