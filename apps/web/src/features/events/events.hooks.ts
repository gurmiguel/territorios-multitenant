import { detectCrawler } from '@repo/utils/crawler'
import { delay } from '@repo/utils/delay'
import { useEffect } from 'react'

import { patchCache } from '~/client-cache/api'

import { ApiClient } from '../api/api.client'

type HandlerResult = readonly [string, any] | readonly [string, any, (current: any | undefined)=> Promise<any> | any]

export type EventsHandler<T> = {
  [k in keyof T]: (data: any)=> Promise<HandlerResult[]> | HandlerResult[] | null
}

interface Options<T extends EventsHandler<T>> {
  handler: T
  enabled?: boolean
}

const MAX_SSE_RETRIES = 5

const textDecoder = new TextDecoder('utf-8')

export function useEventStream<T extends EventsHandler<T>>(endpoint: string, { handler, enabled = true }: Options<T>) {
  useEffect(() => {
    if (!enabled) return
    if (detectCrawler(navigator.userAgent)) return

    let retries = 0

    async function listen(url: string, signal: AbortSignal) {
      try {
        const reader = await ApiClient.getInstance().fetch(endpoint, {
          signal,
          headers: {
            Accept: 'text/stream',
          },
        }).then(response => response.body?.getReader())

        if (!reader) throw new Error('Could not instantiate the stream reader')

        retries = 0
        while (true) {
          signal.throwIfAborted()

          const { value, done } = await reader.read()
          if (done) break

          const payload = textDecoder.decode(value).trim()
          if (!payload.length) continue

          const { event, data } = parseSSEvent(payload)

          if (!event || !handler[event]) continue

          const updates = await handler[event](data)

          for (const [cacheKey, updated, patcher = () => updated] of updates)
            await patchCache(cacheKey, patcher)
        }
      } catch (ex) {
        if (ex instanceof DOMException && ex.name === 'AbortError')
          return
        console.error(ex)
        if (retries++ < MAX_SSE_RETRIES) {
          await delay(1000 * (retries - 1))
          listen(url, signal)
        }
      }
    }

    function parseSSEvent<T>(payload: string) {
      const [ event, id, data ] = payload.split('\n')
        .map(row => {
          const [ key, ...val ] = row.split(': ')
          return { key, value: val.join(': ') }
        })

      return {
        event: event!.value,
        id: Number(id!.value),
        data: JSON.parse(data?.value ?? '{}') as T,
      }
    }

    const abort = new AbortController()
    listen(endpoint, abort.signal)

    return () => {
      abort.abort()
    }
  }, [enabled, endpoint, handler])
}
