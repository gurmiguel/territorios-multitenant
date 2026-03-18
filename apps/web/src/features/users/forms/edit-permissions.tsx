import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { Action, ActionLabels } from '@repo/utils/permissions/action.enum'
import { Area, AreaLabels } from '@repo/utils/permissions/area.enum'
import { Permission, Permissions } from '@repo/utils/permissions/permissions.helper'
import { useForm } from 'react-hook-form'
import {z} from 'zod'

import { Checkbox } from '~/features/adapters/react-hook-form/checkbox'

const availablePermissions = Permissions.getTenantAdminPermissions()

const schema = z.object({
  permissions: z.array(z.string()),
})

export type PermissionsFormData = z.infer<typeof schema>

export function useEditPermissionsForm({ permissions }: { permissions: string[] }) {
  const getDefaultValue = (permissions: string[]) => ({
    permissions,
  } as PermissionsFormData)

  const form = useForm<PermissionsFormData>({
    defaultValues: getDefaultValue(permissions),
    resolver: standardSchemaResolver(schema),
    mode: 'onSubmit',
    progressive: true,
  })

  const fields = (
    <div className="grid grid-cols-2 md:grid-cols-3 space-y-1 gap-x-3 gap-y-1.5">
      {Object.values(Area).map(area => (
        <fieldset key={area} className="flex flex-col justify-center h-full border border-[currentColor] p-2 rounded-md">
          <legend className="px-1 text-sm">{AreaLabels.get(area) ?? area}</legend>

          <div className="flex-1 flex flex-col gap-1">
            {Object.values(Action)
              .filter(action => availablePermissions.includes(Permission(area, action)))
              .map(action => (
                <label key={action} className="flex items-center space-x-1 text-sm">
                  <Checkbox name="permissions" value={Permission(area, action)} className="mb-0" disabled={action === Action.READ && area !== Area.USERS} />
                  <span className="peer-disabled:text-accent-foreground peer-disabled:cursor-not-allowed">{ActionLabels.get(action) ?? action}</span>
                </label>
              ))}
          </div>
        </fieldset>
      ))}
    </div>
  )

  return {
    form,
    fields,
    getDefaultValue,
  }
}
