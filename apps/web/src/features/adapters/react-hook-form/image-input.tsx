/* eslint-disable @next/next/no-img-element */
import { Input } from '@repo/ui/components/ui/input'
import { cn } from '@repo/ui/lib/utils'
import { Override } from '@repo/utils/types'
import { ComponentProps, useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

interface Props {
  name: string
  type?: never
  preview?: boolean
  previewProps?: React.ImgHTMLAttributes<HTMLImageElement>
}

export function ImageInput({ preview = true, previewProps, value: _, ...props }: Override<ComponentProps<typeof Input>, Props>) {
  const { control } = useFormContext()
  const [previewImage, setPreviewImage] = useState<string>()
  const [key, setKey] = useState<number>()

  const handleChangeEvent = (onChange: (file: File | undefined)=> void) => function (e: React.ChangeEvent<HTMLInputElement>) {
    const [file] = e.target.files ?? []
    onChange?.(file)
    if (!preview || !file) return

    const reader = new FileReader()
    reader.onload = () => setPreviewImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const value = useWatch({ control, name: props.name })

  if (!value && previewImage) {
    setKey(k => (k ?? 0) + 1)
    setPreviewImage(undefined)
  }

  return (
    <Controller
      name={props.name}
      render={({ field: { value: _, ...field } }) => (
        <>
          <Input
            key={key}
            accept="image/*"
            {...props}
            {...field}
            type="file"
            className={cn('appearance-none', props.className)}
            onChange={handleChangeEvent(field.onChange)}
          />
          {previewImage && (
            <label htmlFor={props.id || props.name}>
              <img src={previewImage} alt="Preview" {...previewProps} className={cn('object-contain w-full max-h-100', previewProps?.className)} />
            </label>
          )}
        </>
      )}
    />
  )
}
