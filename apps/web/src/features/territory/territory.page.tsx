'use client'

import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useParams } from 'next/navigation'

import Loading from '~/app/loading'
import territoryImageFallback from '~/assets/territory.png'

import { ApiClient } from '../api/api.client'

export default function TerritoryPage() {
  const { number } = useParams()
  const { data: territory, isLoading } = useQuery({
    queryKey: ['territory', number],
    queryFn: () => ApiClient.getInstance()
      .fetch<{ imageUrl: string }>(`/territories/${number}`),
  })

  if (isLoading) return <Loading />

  return (
    <div className="flex flex-col items-center">
      <Image src={territory?.imageUrl ?? territoryImageFallback} alt=""
        width={365} height={365}
        className="mb-4 mx-auto"
      />
      <pre className="w-full whitespace-pre overflow-x-auto">{JSON.stringify(territory ?? null, null, 2)}</pre>
    </div>
  )
}
