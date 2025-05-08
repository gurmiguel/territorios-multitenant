import { Injectable } from '@nestjs/common'

import { type TenantHolderService as ServiceType } from '../tenant-holder.service'

const OriginalService = jest.requireActual('../tenant-holder.service').TenantHolderService as new()=> ServiceType

@Injectable()
export class TenantHolderService extends OriginalService {
  constructor() {
    super()
    this.tenant = { id: 1, name: 'Test', createdAt: new Date(), slug: 'test' }
  }
}
