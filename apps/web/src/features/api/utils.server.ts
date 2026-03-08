'use server'

import { revalidatePath, revalidateTag, updateTag } from 'next/cache'
import { headers } from 'next/headers'

import { getTenantFromHost } from './utils'

export async function getTenant() {
  const headersList = await headers()

  const host = headersList.get('host') ?? ''

  return getTenantFromHost(host)
}

export async function invalidateCache(...tags: string[]) {
  for (const tag of tags)
    revalidateTag(tag, 'max')
}

export async function updateCache(...tags: string[]) {
  for (const tag of tags)
    updateTag(tag)
}

export async function invalidatePath(path: string, type?: 'page' | 'layout') {
  return revalidatePath(path, type)
}
