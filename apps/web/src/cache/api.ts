'use client'

import { ApiClient } from '~/features/api/api.client'

import { CACHE_API_KEY } from './constants'

export async function getCache<T = any>(key: string): Promise<T | null> {
  key = getApiCacheKey(key)
  console.log(key)
  const cache = await caches.open(CACHE_API_KEY)
  const response = await cache.match(key)
  return response ? response.json() : null
}

export async function patchCache<T = any>(key: string, handler: (cached: T | null)=> T | null): Promise<void> {
  key = getApiCacheKey(key)
  const cache = await caches.open(CACHE_API_KEY)
  const cached = await cache.match(key)
    .then(res => res?.json())
    .catch(() => null)
  const response = new Response(JSON.stringify(handler(cached ?? null)), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
  await cache.put(key, response)
}

export function getApiCacheKey(endpoint: string) {
  return ApiClient.getInstance().buildUrl(endpoint)
}
