'use server'

import { updateTag } from 'next/cache'

import { ServerApiClient } from '~/features/api/api.server'
import { withRequestScope } from '~/features/di/context'

export const savePermissions = withRequestScope(async (id: string, permissions: string[]) => {
  const api = ServerApiClient.getInstance()

  await api.mutate<{ ok: boolean }>(`/users/${id}/permissions`, { permissions: permissions }, {
    method: 'PATCH',
  })

  updateTag('admin.users')
})
