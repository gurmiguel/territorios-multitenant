import { defaultCache, PAGES_CACHE_NAME } from '@serwist/next/worker'
import parseDuration from 'parse-duration'
import { ExpirationPlugin, NetworkFirst, PrecacheEntry, Serwist, SerwistGlobalConfig } from 'serwist'

import { CACHE_API_KEY } from '~/client-cache/constants'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request, sameOrigin }) =>
        sameOrigin
        && request.method === 'GET'
        && request.headers.get('RSC') === '1'
        && request.headers.get('Next-Router-Prefetch') === '1',
      handler: new NetworkFirst({
        cacheName: PAGES_CACHE_NAME.rscPrefetch,
        matchOptions: { ignoreSearch: true, ignoreVary: true },
        plugins: [
          new ExpirationPlugin({
            maxEntries: 80,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },
    {
      matcher: ({ request, sameOrigin }) =>
        sameOrigin
        && request.headers.get('RSC') === '1'
        && request.method === 'GET',
      handler: new NetworkFirst({
        cacheName: PAGES_CACHE_NAME.rsc,
        matchOptions: { ignoreSearch: true, ignoreVary: true },
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
            maxAgeFrom: 'last-used',
          }),
        ],
      }),
    },

    {
      matcher: ({ request, sameOrigin, url }) =>
        sameOrigin
        && request.method === 'GET'
        && ['', 'document'].includes(request.destination)
        && !!url.pathname.match(/^\/[^.]*$/i), // match extension-less urls
      handler: new NetworkFirst({
        cacheName: PAGES_CACHE_NAME.html,
        matchOptions: { ignoreSearch: true, ignoreVary: true },
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          }),
        ],
      }),
    },
    {
      matcher: ({ request, sameOrigin, url }) =>
        sameOrigin
        && request.method === 'GET'
        && !!url.pathname.match(/^\/_next\/(static|image)/i),
      handler: new NetworkFirst({
        cacheName: 'static-assets',
        matchOptions: {
          ignoreSearch: false,
          ignoreVary: true,
        },
        plugins: [
          new ExpirationPlugin({
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          }),
        ],
      }),
    },
    {
      matcher: ({ request, url }) =>
        url.origin === process.env.NEXT_PUBLIC_API_URL
        && request.method === 'GET'
        && request.headers.get('Accept') !== 'text/stream',
      handler: new NetworkFirst({
        cacheName: CACHE_API_KEY,
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: parseDuration('7 days')!,
          }),
        ],
      }),
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [
      {
        matcher: ({ request }) => {
          const sameOrigin = request.url.startsWith(self.location.origin)
          const url = new URL(request.url)
          const isRSC = url.searchParams.has('_rsc')
          console.log('offline fallback', url.href, sameOrigin
            && !isRSC
            && request.method === 'GET'
            && ['', 'document'].includes(request.destination)
            && !!url.pathname.match(/^\/[^.]*$/i))
          return sameOrigin
            && !isRSC
            && request.method === 'GET'
            && ['', 'document'].includes(request.destination)
            && !!url.pathname.match(/^\/[^.]*$/i) // match extension-less urls
        },
        url: '/territorios/offline',
      },
    ],
  },
})

const urlsToCache = ['/territorios', '/territorios/offline', '/mapa-completo']

self.addEventListener('install', async event => {
  serwist.handleInstall(event)
  const skipWaiting = self.skipWaiting()

  event.waitUntil(skipWaiting)

  event.waitUntil(skipWaiting.then(() =>
    Promise.all(urlsToCache.map(entry => {
      return serwist.handleRequest({
        request: new Request(entry),
        event,
      })
    })),
  ))
})

serwist.addEventListeners()
