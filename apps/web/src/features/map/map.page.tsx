'use client'
/* eslint-disable @next/next/no-img-element */
import { ImageZoom } from '@repo/ui/components/image-zoom'
import { Button } from '@repo/ui/components/ui/button'
import { CameraOffIcon, PencilIcon } from '@repo/ui/components/ui/icons'
import { useState } from 'react'

import { useAuth } from '../auth/auth.context'
import { HeaderConfig } from '../header/context'
import { EditImageDialog } from './dialogs/edit-image.dialog'

export function MapPage({ mapUrl }: { mapUrl: string | undefined }) {
  const { can } = useAuth()

  const [openDialog, setOpenDialog] = useState<'edit-image' | null>(null)

  return (
    <div className="flex flex-col">
      <HeaderConfig title="Mapa Completo" showMap backRoute />
      <div className="relative w-full aspect-3/4">
        {mapUrl ? (
          <ImageZoom src={mapUrl}>
            <img src={mapUrl} alt="" className="absolute-fill" style={{ objectFit: 'contain' }} />
          </ImageZoom>
        ) : (
          <label htmlFor="edit-image">
            <CameraOffIcon className="my-24 mx-auto size-24" />
          </label>
        )}
        {can('assets:write') && can('territories:write') && (
          <Button id="edit-image" variant="ghost"
            color="foreground"
            className="absolute top-3 right-2 rounded-full size-12 p-0!"
            onClick={() => setOpenDialog('edit-image')}
          >
            <PencilIcon className="size-5" />
          </Button>
        )}
      </div>

      <EditImageDialog
        open={openDialog === 'edit-image'}
        context={{ imageUrl: mapUrl }}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  )
}
