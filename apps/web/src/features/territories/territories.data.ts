import { cache } from 'react'

import { ServerApiClient } from '../api/api.server'

export const fetchTerritories = cache(async () => {
  const data = await ServerApiClient.getInstance().query<{items: any[]}>('/territories')

  return { territories: data.items }
})
