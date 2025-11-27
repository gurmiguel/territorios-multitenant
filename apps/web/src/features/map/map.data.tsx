import { getTenantFromHost } from '../api/utils'
import { getTenant } from '../api/utils.server'

export async function getMapUrl() {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/congregations`, {
    headers: {
      'X-Forwarded-Host': typeof window === 'undefined' ? await getTenant() : getTenantFromHost(window.location.host),
    },
  })
  const data = await response.json()
  const mapUrl = data.map?.publicUrl

  return mapUrl
}
