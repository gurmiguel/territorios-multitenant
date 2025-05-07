import { Controller, Get, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common'
import { Request as NextRequest } from 'express'

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

  @UseGuards(RefreshTokenAuthGuard)
  @Post('/refresh')
  async refreshTokenAuth(@Request() req: NextRequest) {
    const { user } = req

    if (user) return await this.authService.signin(user)
    else throw new UnauthorizedException('Invalid Refresh token')
  }
}
