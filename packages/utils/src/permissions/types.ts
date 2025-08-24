import { Action } from './action.enum'
import { Area } from './area.enum'

export type IPermission = `${Area}:${Action}` | [Area, Action]
export type IPermissionStr = Extract<IPermission, string>
