import { ImageZoom } from '@repo/ui/components/image-zoom'
import Image from 'next/image'

import { getMapUrl } from './map.data'
import { HeaderConfig } from '../header/context'

export async function MapPage() {
  const mapUrl = await getMapUrl()

  return (
    <div className="flex flex-col">
      <HeaderConfig title="Mapa Completo" showMap backRoute />
      {mapUrl && (
        <div className="relative w-full aspect-3/4">
          <ImageZoom src={mapUrl}>
            <Image src={mapUrl} alt="" layout="fill" objectFit="contain" />
          </ImageZoom>
        </div>
      )}
    </div>
  )
}
