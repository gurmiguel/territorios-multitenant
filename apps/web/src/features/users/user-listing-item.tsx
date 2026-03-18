import { ShieldUserIcon, UserIcon } from '@repo/ui/components/ui/icons'
import { cn } from '@repo/ui/lib/utils'
import { Permissions } from '@repo/utils/permissions/permissions.helper'
import { capitalize } from '@repo/utils/text'
import React, { ReactElement, useState } from 'react'

import GoogleIcon from '~/assets/google-icon.svg'

import { useAuth } from '../auth/auth.context'
import { EditPermissionsDialog } from './dialogs/edit-permissions.dialog'
import { User } from './types'

interface Props {
  item: User
}

const providersIcons: Record<string, ReactElement<React.JSX.IntrinsicElements['svg']>> = {
  google: <GoogleIcon className="text-red-500" />,
}

export function UserListingItem({ item }: Props) {
  const { state: { user }, can } = useAuth()

  const canEditPermissions = can('users:write', 'users:delete')

  const [openDialog, setOpenDialog] = useState<'edit-permissions' | null>(null)

  const isItemAdmin = Permissions.getTenantAdminPermissions().every(p => item.permissions.includes(p))

  function handleItemClick() {
    if (!canEditPermissions) return
    setOpenDialog('edit-permissions')
  }

  const Component = canEditPermissions ? 'button' : 'div'

  return (
    <>
      <Component type="button"
        className="flex flex-row items-center gap-1.5 w-full py-2.5 px-2 font-normal text-sm text-left data-[canedit=true]:hover:bg-gray-100/50 data-[canedit=true]:active:bg-gray-200 transition-colors"
        data-canedit={canEditPermissions}
        onClick={handleItemClick}
      >
        <UserIcon className="size-6 p-1 border border-[currentColor] rounded-full shrink-0" />
        <div className="flex flex-col leading-[1em] flex-1 shrink truncate">
          <span>
            <strong className="font-semibold">{item.name}</strong>
            {user?.id === item.id && <span className="text-xs text-gray-500"> (Você)</span>}
          </span>
          <small>{item.email}</small>
        </div>

        <div className="flex items-center gap-2 ml-auto mr-0">
          {isItemAdmin && (
            <span title="Usuário administrador">
              <ShieldUserIcon className="size-5 text-success" strokeWidth={1.5} /></span>
          )}
          {item.providers.map(({ provider }) => {
            const Icon = providersIcons[provider]
            if (!Icon) return null
            return (
              <span key={provider} title={`Conectado via ${capitalize(provider)}`}>
                {React.cloneElement(Icon, { className: cn('size-4', Icon.props.className) })}
              </span>
            )
          })}
        </div>
      </Component>

      <EditPermissionsDialog
        open={openDialog === 'edit-permissions'}
        context={{ id: item.id, permissions: item.permissions }}
        onClose={() => setOpenDialog(null)}
      />
    </>
  )
}
