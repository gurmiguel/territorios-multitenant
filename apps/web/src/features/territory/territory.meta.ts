import { Metadata } from 'next'
import parseDuration from 'parse-duration'
import { cache } from 'react'

import territoryImageFallback from '~/assets/territory.png'

import { Territory } from './types'
import { ServerApiClient } from '../api/api.server'
import { getTenant } from '../api/utils.server'

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }): Promise<Metadata> {
  const { number } = await params

  const territory = await fetchTerritory(number)

  return {
    title: `Território ${territory.number}`,
    openGraph: {
      images: [territory.imageUrl!].filter(Boolean),
    },
  } satisfies Metadata
}

const fetchTerritory = cache(async (number: string): Promise<Territory> => {
  if (number === 'offline') {
    return {
      id: -1,
      color: '#ffffff',
      number: `${number} - offline`,
      streets: [],
      hidden: false,
      imageUrl: territoryImageFallback.src,
      map: null,
    }
  }

  const territory = await ServerApiClient.getInstance().query<Territory>(`/territories/${number}`, {
    credentials: 'omit',
    headers: { 'x-tenant-host': await getTenant() },
    next: {
      revalidate: parseDuration('1 day')!,
      tags: [`territories/${number}`],
    },
  })

  return territory
})
