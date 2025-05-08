import { Controller, Get, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common'

import { AuthService } from './auth.service'
import { GoogleAuthGuard } from './guards/google.guard'
import { LocalAuthGuard } from './guards/local.guard'
import { RefreshTokenAuthGuard } from './guards/refresh-token.guard'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req: Application.Request) {
    return await this.authService.signin(req.user!)
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google')
  async google() {
    /* redirect automatically handled by passport */
  }

  @UseGuards(GoogleAuthGuard)
  @Get('/google/callback')
  async googleCallback() {
    /* redirect automatically handled by passport/custom guard */
  }

  @UseGuards(RefreshTokenAuthGuard)
  @Post('/refresh')
  async refreshTokenAuth(@Request() req: Application.Request) {
    const { user } = req

    if (user) return await this.authService.signin(user)
    else throw new UnauthorizedException('Invalid Refresh token')
  }
}
