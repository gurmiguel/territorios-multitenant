import { cache } from 'react'

import { ServerApiClient } from '../api/api.server'
import { getTenant } from '../api/utils.server'
import { Congregation } from '../territory/types'

export const getCongregationData = cache(async function() {
  const congregation = await ServerApiClient.getInstance().query<Congregation>('/congregations', {
    headers: { 'x-tenant-host': await getTenant() },
    credentials: 'omit',
    next: {
      revalidate: 60,
    },
  })

  return congregation
})
