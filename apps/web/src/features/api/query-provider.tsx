'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { cache } from 'react'

import { ApiClient } from './api.client'

const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5000,
      queryFn: ({ queryKey, signal }) => ApiClient.getInstance()
        .query(queryKey.join('/'), { signal }),
    },
    mutations: {
      mutationFn: variables => {
        const [endpoint, data] = variables as [string, unknown]
        return ApiClient.getInstance()
          .mutate(endpoint, data)
      },
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
