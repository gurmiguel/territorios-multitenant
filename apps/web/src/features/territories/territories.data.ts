import { ServerApiClient } from '../api/api.server'

export async function generateMetadata() {
  return {
    title: 'Territórios',
  }
}

export async function fetchTerritories() {
  const data = await ServerApiClient.getInstance().fetch<{items: any[]}>('/territories')

  return { territories: data.items }
}
