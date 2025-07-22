import { Metadata } from 'next'
import { cache } from 'react'

import { Territory } from './types'
import { ServerApiClient } from '../api/api.server'

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const territory = await fetchTerritory(number)

  return {
    title: `Território ${territory.number}`,
    openGraph: {
      images: [territory.imageUrl],
    },
  } satisfies Metadata
}

const fetchTerritory = cache(async (number: string) => {
  const territory = await ServerApiClient.getInstance().query<Territory>(`/territories/${number}`, {
    next: {
      revalidate: 86400, // 1 day
    },
  })

  return territory
})
