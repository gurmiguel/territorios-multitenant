import { ForbiddenException } from '@nestjs/common'

export class MissingTenantException extends ForbiddenException {
  constructor() {
    super('Missing tenant in the request')
    this.name = 'MissingTenantException'
  }
}
