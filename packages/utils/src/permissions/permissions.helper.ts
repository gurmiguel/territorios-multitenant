import { Action } from './action.enum'
import { Area } from './area.enum'
import { IPermission, IPermissionStr } from './types'

export const Permissions = new class PermissionsHelper {
  getDefaultUserPermissions() {
    return this.getFor({
      area: { exclude: [Area.TENANTS, Area.USERS] },
      action: { include: [Action.READ] },
    })
  }

  getTenantAdminPermissions(areas?: Area[], exclude?: Action[]): IPermissionStr[] {
    return this.getFor({
      area: { include: areas },
      action: { exclude },
    })
  }

  getFor(config?: { area?: GetForConfig<Area>, action?: GetForConfig<Action> }): IPermissionStr[] {
    const areas = (config?.area?.include ?? Object.values(Area))
      .filter(area => !config?.area?.exclude?.includes(area))
    const actions = (config?.action?.include ?? Object.values(Action))
      .filter(action => !config?.action?.exclude?.includes(action))

    return areas.flatMap(area => actions.map(action => Permission(area, action)))
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
