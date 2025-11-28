import { connection } from 'next/server'
import { Suspense } from 'react'

export function getTenantFromHost(host: string): string {
  if (process.env.NEXT_PUBLIC_STATIC_TENANT) return process.env.NEXT_PUBLIC_STATIC_TENANT

  return host ?? ''
}

export async function DummyAwaiter() {
  const Connection = async () => {
    await connection()
    return null
  }

  return (
    <Suspense>
      {/* eslint-disable-next-line react-hooks/static-components */}
      <Connection />
    </Suspense>
  )
}
