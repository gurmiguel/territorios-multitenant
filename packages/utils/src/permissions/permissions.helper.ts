import { Action } from './action.enum'
import { Area } from './area.enum'
import { IPermission, IPermissionStr } from './types'

const allPermissions = new Set(Object.values(Area).flatMap(area =>
  Object.values(Action).map(action => [area, action].join(':')),
))

export const Permissions = new class PermissionsHelper {
  getDefaultUserPermissions() {
    return this.getFor({
      area: { exclude: [Area.CONGREGATION, Area.USERS] },
      action: { include: [Action.READ] },
    })
  }

  getTenantAdminPermissions(areas?: Area[], exclude?: Action[]): IPermissionStr[] {
    const incompatible = this.getFor({ area: { include: [Area.CONGREGATION] }, action: { exclude: [Action.WRITE] } })
    return this.getFor({
      area: { include: areas },
      action: { exclude },
    }).filter(p => !incompatible.includes(p))
  }

  getFor(config?: { area?: GetForConfig<Area>, action?: GetForConfig<Action> }): IPermissionStr[] {
    const areas = (config?.area?.include ?? Object.values(Area))
      .filter(area => !config?.area?.exclude?.includes(area))
    const actions = (config?.action?.include ?? Object.values(Action))
      .filter(action => !config?.action?.exclude?.includes(action))

    return areas.flatMap(area => actions.map(action => Permission(area, action)))
  }

  isValid(permission: string) {
    return allPermissions.has(permission)
  }
}

export function Permission(permission: IPermission): IPermissionStr
export function Permission(area: Area, action: Action): IPermissionStr
export function Permission(permissionOrArea: IPermission | Area, action?: Action) {
  if (Array.isArray(permissionOrArea))
    return permissionOrArea.join(':') as IPermissionStr
  else if (action !== undefined)
    return `${permissionOrArea}:${action}` as IPermissionStr
  else
    return permissionOrArea as Exclude<Area, typeof permissionOrArea>
}

interface GetForConfig<T extends Area | Action> {
  exclude?: T[]
  include?: T[]
}
