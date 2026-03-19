'use server'

import { delay } from '@repo/utils/delay'
import { updateTag } from 'next/cache'

import { ServerApiClient } from '~/features/api/api.server'
import { withRequestScope } from '~/features/di/context'

export const deleteUser = withRequestScope(async (userId: string) => {
  const api = ServerApiClient.getInstance()

  await api.mutate(`/users/${userId}`, null, { method: 'DELETE' })

  await delay(500)

  updateTag('admin.users')
})
