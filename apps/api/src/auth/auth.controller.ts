import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common'

import { AuthService } from './auth.service'
import { GoogleAuthGuard } from './guards/google.guard'
import { LocalAuthGuard } from './guards/local.guard'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req) {
    return await this.authService.signin(req.user)
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  async google(@Request() _req) { /* redirect automatically handled by passport */ }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  async googleCallback(@Request() req) {
    // TODO: redirect user back to client with refresh token information
  }

  @Post('/refresh')
  async refreshTokenAuth(@Request() req) {
    // TODO: implement refresh token login
  }
}
