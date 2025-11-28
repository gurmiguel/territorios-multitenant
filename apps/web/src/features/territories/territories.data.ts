import { cacheTag } from 'next/cache'
import { cache } from 'react'

import { ServerApiClient } from '../api/api.server'

export const fetchTerritories = cache(async () => {
  'use cache'
  cacheTag('territories')

  const data = await ServerApiClient.getInstance().query<{items: any[]}>('/territories')

  return { territories: data.items }
})
