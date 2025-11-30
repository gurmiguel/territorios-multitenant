import { CipherGCMTypes, createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { authenticator } from 'otplib'

import { Configuration } from '~/config/configuration'
import { PrismaClientKnownRequestError } from '~/generated/prisma/internal/prismaNamespace'
import { SuperadminService } from '~/superadmin/superadmin.service'

@Injectable()
export class TfaService {
  protected static algorithm: CipherGCMTypes = 'aes-256-gcm'
  protected static hashSeparator = '::-::'

  protected readonly logger = new Logger(TfaService.name)
  protected readonly secret: string
  protected readonly appTitle: string

  constructor(
    protected readonly superadminService: SuperadminService,
    configService: ConfigService<Configuration>,
  ) {
    this.secret = configService.get('auth', { infer: true })?.secret ?? (() => {throw new Error('Must define an auth secret')})()
    this.appTitle = configService.get('constants', { infer: true })?.appTitle ?? 'DefaultAppTitle'
    if (configService.get('mode') === 'development')
      this.appTitle = `[DEV] ${this.appTitle}`
  }

  async initiate(username: string) {
    try {
      const secret = authenticator.generateSecret()

      const { iv, authTag, encrypted } = this.encryptUserHash(secret)

      await this.superadminService.update({
        where: { email: username },
        data: { secret: Buffer.from([iv, authTag, encrypted].join(TfaService.hashSeparator), 'utf8').toString('base64'), tfaEnabled: false },
      })

      const uri = authenticator.keyuri(username, this.appTitle, secret)

      return { uri, secret }
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw err

      this.logger.error('Error updating superadmin secret', err)
      throw new BadRequestException('Invalid request')
    }
  }

  async enable(username: string, token: string) {
    const user = await this.superadminService.find({ where: { email: username } })

    if (!user) throw new BadRequestException('Invalid Request', { cause: new Error(`User not found for: ${username}`) })
    if (user.tfaEnabled) throw new BadRequestException('Invalid Request', { cause: new Error(`TFA already enabled for user: ${username}`) })

    if (!await this.verifyToken(username, token))
      throw new BadRequestException('Invalid Request', { cause: new Error('Invalid token for user: ' + username) })

    await this.superadminService.update({ where: { id: user.id }, data: { tfaEnabled: true } })
  }

  async verifyToken(username: string, token: string) {
    const admin = await this.superadminService.find({
      where: { email: username },
    })

    if (!admin?.secret)
      throw new BadRequestException('Invalid Request', { cause: new Error(`TFA secret not initiated for user: ${username}`) })

    const [iv, authTag, secret] = Buffer.from(admin.secret, 'base64').toString('utf8').split(TfaService.hashSeparator)

    if (!iv || !authTag || !secret)
      throw new InternalServerErrorException('Invalid TFA secret or IV', { cause: new Error(`Invalid TFA secret or IV for user: ${username}. [iv=${iv};authTag=${authTag};secret=${secret}]`) })

    const decrypted = this.decryptUserHash(secret, authTag, iv)

    return authenticator.verify({ secret: decrypted, token })
  }

  private get secretAsKey() {
    return createHash('sha256').update(this.secret).digest('base64').substring(0, 32)
  }

  protected encryptUserHash(hash: string) {
    const iv = randomBytes(12)
    const cipher = createCipheriv(TfaService.algorithm, this.secretAsKey, iv)

    let encrypted = cipher.update(hash, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag().toString('hex')

    return { iv: iv.toString('hex'), encrypted, authTag }
  }

  protected decryptUserHash(hash: string, authTag: string, iv: string) {
    const decipher = createDecipheriv(TfaService.algorithm, this.secretAsKey, Buffer.from(iv, 'hex'))
    decipher.setAuthTag(Buffer.from(authTag, 'hex'))

    let decrypted = decipher.update(hash, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }
}
