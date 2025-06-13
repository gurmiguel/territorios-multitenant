import Image from 'next/image'

import { getMapUrl } from './map.data'

export async function MapPage() {
  const mapUrl = await getMapUrl()

  return (
    <div className="flex flex-col">
      <div className="relative w-full aspect-[3/4]">
        <Image src={mapUrl} alt="" layout="fill" objectFit="contain" />
      </div>
    </div>
  )
}
