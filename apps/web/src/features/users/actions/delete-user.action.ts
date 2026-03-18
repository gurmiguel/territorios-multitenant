'use server'

import { delay } from '@repo/utils/delay'
import { updateTag } from 'next/cache'

import { ServerApiClient } from '~/features/api/api.server'

export async function deleteUser(userId: string) {
  const api = ServerApiClient.getInstance()

  await api.mutate(`/users/${userId}`, null, { method: 'DELETE' })

  await delay(500)

  updateTag('admin.users')
}
