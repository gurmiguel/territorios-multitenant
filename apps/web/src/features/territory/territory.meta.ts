import { Metadata } from 'next'
import { cache } from 'react'

import { Territory } from './types'
import { ServerApiClient } from '../api/api.server'
import { getTenant } from '../api/utils.server'

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
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
      number,
      streets: [],
      hidden: false,
      imageUrl: null,
      map: null,
    }
  }

  const territory = await ServerApiClient.getInstance().query<Territory>(`/territories/${number}`, {
    credentials: 'omit',
    headers: { 'x-tenant-host': await getTenant() },
    next: {
      revalidate: 86400, // 1 day
    },
  })

  return territory
})
