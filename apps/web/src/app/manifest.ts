import { MetadataRoute } from 'next'

import { ServerApiClient } from '~/features/api/api.server'
import { getTenant } from '~/features/api/utils.server'
import { Congregation } from '~/features/territory/types'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const congregation = await ServerApiClient.getInstance().query<Congregation>('/congregations', {
    headers: { 'X-Forwarded-Host': await getTenant() },
    credentials: 'omit',
    next: {
      revalidate: 86400, // 1 day
    },
  })

  return {
    name: `Territórios ${congregation.name}`,
    short_name: 'Territórios',
    description: 'Gerenciamento dos territórios de campo da congregação',
    theme_color: '#778bc4',
    id: '/',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon',
      },
      {
        src: '/assets/min/icon-512x512.png',
        type: 'image/png',
        sizes: '512x512',
      },
      {
        src: '/assets/min/icon-192x192.png',
        type: 'image/png',
        sizes: '192x192',
      },
    ],
    screenshots: [
      {
        src: '/assets/screenshot-1.jpg',
        sizes: '370x800',
        type: 'image/jpeg',
        form_factor: 'narrow',
        label: 'Listagem de Territórios',
      },
    ],
  }
}
