'use server'

import { headers } from 'next/headers'

import { getTenantFromHost } from './utils'

export async function getTenant() {
  const headersList = await headers()

  const host = headersList.get('host') ?? ''

  return getTenantFromHost(host)
}
