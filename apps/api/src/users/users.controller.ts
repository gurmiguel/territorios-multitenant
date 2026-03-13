import { BadRequestException, Controller, Get, Logger, NotFoundException, Param, Patch, Request } from '@nestjs/common'
import { Action } from '@repo/utils/permissions/action.enum'
import { Area } from '@repo/utils/permissions/area.enum'
import { Permissions } from '@repo/utils/permissions/permissions.helper'

import { Allow } from '~/auth/decorators/allow.decorator'
import { SafeAuth } from '~/auth/decorators/safe-auth.decorator'

import { UsersService } from './users.service'

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
      where: { congregationId },
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
        permissions: req.body.permissions,
      },
    })

    this.logger.log(`[Tenant ${req.user!.congregation.name}] User ${user.email} permissions updated by ${req.user!.email}`, {
      permissions: req.body.permissions,
    })

    return { ok: true }
  }
}
