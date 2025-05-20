import { Test, TestingModule } from '@nestjs/testing'

import { AppModule } from '~/app.module'

import { AssetsService } from './assets.service'

describe('AssetsService', () => {
  let service: AssetsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    service = module.get<AssetsService>(AssetsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
