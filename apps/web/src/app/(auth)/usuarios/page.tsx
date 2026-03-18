import { Permission } from '@repo/utils/permissions/permissions.helper'
import { redirect } from 'next/navigation'

import { ServerApiClient } from '~/features/api/api.server'
import { tryDecodeJwt } from '~/features/auth/token'
import { HeaderConfig } from '~/features/header/context'
import { User } from '~/features/users/types'
import { UsersListing } from '~/features/users/users-listing'

export default async function Page() {
  const api = ServerApiClient.getInstance()
  const { accessToken } = await api.getAuthCookies()
  const user = tryDecodeJwt(accessToken)

  if (!user || !user.isSafeProvider || !user.permissions.includes(Permission('users:read')))
    redirect('/')

  let users: User[]
  try {
    users = await api.fetch('/users', {
      next: { tags: ['admin.users'] },
    }).then(res => res.json())
  } catch (err) {
    console.error(err)
    redirect('/')
  }

  return (
    <div className="relative -mt-4 min-h-full w-full">
      <HeaderConfig title="Usuários" show={['map']} hidden={['users']} backRoute />

      <UsersListing users={users} />
    </div>
  )
}
