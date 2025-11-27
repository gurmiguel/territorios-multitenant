'use server'

import { headers } from 'next/headers'

import { getTenantFromHost } from './utils'

export async function getTenant() {
  const headersList = await headers()

  if (process.env.NEXT_PUBLIC_STATIC_TENANT) return process.env.NEXT_PUBLIC_STATIC_TENANT

  const host = headersList.get('host') ?? ''

  return getTenantFromHost(host)
}
