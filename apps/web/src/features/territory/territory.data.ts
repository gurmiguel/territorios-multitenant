'use server'

import { Metadata } from 'next'
import { cache } from 'react'

import { ServerApiClient } from '../api/api.server'

export async function generateMetadata({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params
  const { territory } = await fetchTerritory(number)

  return {
    title: `Território ${territory.number}`,
    openGraph: {
      images: [territory.imageUrl],
    },
  } satisfies Metadata
}

export const fetchTerritory = cache(async (number: string) => {
  const territory = await ServerApiClient.getInstance().fetch<any>(`/territories/${number}`)

  return { territory }
})
