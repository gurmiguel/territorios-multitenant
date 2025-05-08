import { Controller, Get, Request } from '@nestjs/common'

@Controller('users')
export class UsersController {
  @Get()
  async getUser(@Request() req: Application.Request) {
    return req.user!
  }
}
