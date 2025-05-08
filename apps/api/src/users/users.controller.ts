import { Controller, Get, Request, UseGuards } from '@nestjs/common'

import { AccessTokenAuthGuard } from '~/auth/guards/access-token.guard'

@UseGuards(AccessTokenAuthGuard)
@Controller('users')
export class UsersController {
  @Get()
  async getUser(@Request() req: Express.Request) {
    return req.user!
  }
}
