import { applyDecorators, SetMetadata } from '@nestjs/common'
import { IPermission, PermissionMode } from '@repo/utils/permissions/index'

const DEFAULT_MODE: PermissionMode = PermissionMode.ANY

export const PERMISSIONS_KEY = Symbol.for('permissions')
export const PERMISSIONS_MODE_KEY = Symbol.for('permissions-mode')
export function Allow(permission: IPermission, ...permissions: IPermission[]): ReturnType<typeof applyDecorators>
export function Allow(mode: PermissionMode, ...permissions: IPermission[]): ReturnType<typeof applyDecorators>
export function Allow(...args: (IPermission | PermissionMode)[]): ReturnType<typeof applyDecorators> {
  const permissions = [...args]
  let mode = permissions.shift()
  // if first arg is not of type PermissionMode, treat it as IPermission and use the default mode
  if (!Object.values(PermissionMode).includes(mode as PermissionMode)) {
    permissions.unshift(mode as IPermission)
    mode = DEFAULT_MODE
  }

  return applyDecorators(
    SetMetadata(PERMISSIONS_KEY, permissions),
    SetMetadata(PERMISSIONS_MODE_KEY, mode),
  )
}
