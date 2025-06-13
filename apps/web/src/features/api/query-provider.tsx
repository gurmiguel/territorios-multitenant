'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { cache } from 'react'

const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5000,
    },
    mutations: {
      networkMode: 'offlineFirst',
    },
  },
}))

export function QueryProvider({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <ReactQueryDevtools />
      {children}
    </QueryClientProvider>
  )
}
