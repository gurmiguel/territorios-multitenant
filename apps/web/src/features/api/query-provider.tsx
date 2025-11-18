'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { cache } from 'react'

import { ApiError } from './api.base'
import { ApiClient } from './api.client'

const MAX_RETRIES = 4

const getQueryClient = cache(() => new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5000,
      queryFn: ({ queryKey, signal }) => ApiClient.getInstance()
        .query(queryKey.join('/'), { signal }),
      retry(failureCount, error) {
        return failureCount < MAX_RETRIES && !(error instanceof ApiError && error.status === 499)
      },
    },
    mutations: {
      mutationFn: variables => {
        const [endpoint, data] = variables as [string, unknown]
        return ApiClient.getInstance()
          .mutate(endpoint, data)
      },
      retry(failureCount, error) {
        return failureCount < MAX_RETRIES && !(error instanceof ApiError && error.status === 499)
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
