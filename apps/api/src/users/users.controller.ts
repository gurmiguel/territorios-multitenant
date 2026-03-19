import { BadRequestException, Controller, Delete, Get, Logger, NotFoundException, Param, Patch, Request } from '@nestjs/common'
import { Action } from '@repo/utils/permissions/action.enum'
import { Area } from '@repo/utils/permissions/area.enum'
import { Permissions } from '@repo/utils/permissions/permissions.helper'
import { IPermissionStr } from '@repo/utils/permissions/types'

import { Allow } from '~/auth/decorators/allow.decorator'
import { SafeAuth } from '~/auth/decorators/safe-auth.decorator'

import { UsersService } from './users.service'

const ALL_PERMISSIONS = Permissions.getTenantAdminPermissions()

@Controller('users')
export class UsersController {
  protected readonly logger = new Logger(UsersController.name)

  constructor(
    protected readonly usersService: UsersService,
  ) {}

  @Get('me')
  async getUser(@Request() req: Application.Request) {
    return req.user!
  }

  @SafeAuth()
  @Allow([Area.USERS, Action.READ])
  @Get()
  async getUsers(@Request() req: Application.Request) {
    const { congregationId = -1 } = req.user!

    const users = await this.usersService.findMany({
      where: { congregationId, deletedAt: null },
      select: {
        email: true,
        id: true,
        name: true,
        permissions: true,
        createdAt: true,
        providers: {
          select: { provider: true },
        },
      },
      orderBy: [
        { createdAt: 'asc' },
      ],
    })

    return users
  }

  @SafeAuth()
  @Allow([Area.USERS, Action.WRITE])
  @Patch(':userId/permissions')
  async updateUserPermissions(@Param('userId') userId: string, @Request() req: Application.Request) {
    const { congregationId } = req.user!
    const permissions: string[] = req.body.permissions

    if (permissions.some(p => !Permissions.isValid(p)))
      throw new BadRequestException('Permissions value is not valid')

    const user = await this.usersService.find({ where: { id: userId ?? '--unknown--' } })

    if (!user)
      throw new NotFoundException('User not found')

    if (congregationId !== user.congregationId)
      throw new BadRequestException('You cannot update this user\'s permissions')

    await this.usersService.update({
      where: { id: userId },
      data: {
        permissions: (req.body.permissions as IPermissionStr[])
          // keep original permission order
          .toSorted((a, b) => {
            const ai = ALL_PERMISSIONS.indexOf(a)
            const bi = ALL_PERMISSIONS.indexOf(b)
            return ai - bi
          }),
      },
    })

    this.logger.log(`[Tenant ${req.user!.congregation.name}] User ${user.email} permissions updated by ${req.user!.email}`, {
      permissions: req.body.permissions,
    })

    return { ok: true }
  }

  @SafeAuth()
  @Allow([Area.USERS, Action.DELETE])
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Request() req: Application.Request) {
    const { congregationId } = req.user!

    try {
      await this.usersService.update({
        where: { id, congregationId },
        data: {
          deletedAt: new Date(),
          // reset user permissions on delete
          permissions: Permissions.getDefaultUserPermissions(),
        },
      })

      return { ok: true }
    } catch (err) {
      this.logger.error(`Failed to delete user with ID ${id} in congregation ${congregationId}`, err)
      throw new BadRequestException('Failed to delete user')
    }
  }
}
