import { Body, Controller, ForbiddenException, Post, Res } from '@nestjs/common'
import QRCode from 'qrcode'

import { AuthService } from '~/auth/auth.service'
import { AllowAnonymous } from '~/auth/decorators/allow-anonymous.decorator'
import { SuperadminService } from '~/superadmin/superadmin.service'

import { TfaService } from './tfa.service'

@Controller('tfa')
@AllowAnonymous()
export class TfaController {
  constructor(
    protected readonly tfaService: TfaService,
    protected readonly superadminService: SuperadminService,
    protected readonly authService: AuthService,
  ) {}

  @Post('initiate')
  async initiate(@Body('username') username: string, @Res() res: Application.Response) {
    const { uri } = await this.tfaService.initiate(username)

    res.contentType('image/png')

    await QRCode.toFileStream(res, uri)
  }

  @Post('enable')
  async enable(@Body('username') username: string, @Body('token') token: string) {
    await this.tfaService.enable(username, token)
  }

  @Post('signin')
  async verify(@Body('username') username: string, @Body('token') token: string) {
    if (!await this.tfaService.verifyToken(username, token))
      throw new ForbiddenException('Invalid Request', { cause: new Error(`TFA verification failed. [username=${username};token=${token}]`) })

    const superadmin = await this.superadminService.find({
      where: { email: username },
    })

    if (!superadmin)
      throw new ForbiddenException('Invalid Request', { cause: new Error(`Superadmin user not found. ${username}`) })

    return this.authService.superadminSignin(superadmin!)
  }
}
