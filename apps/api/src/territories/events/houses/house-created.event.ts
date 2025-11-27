import { House, Territory } from '~/generated/prisma/client'
import { EventData, EventRecord } from '~/utils/event'

export class HouseCreatedEvent extends EventRecord<HouseCreatedEvent> implements EventData {
  public static readonly event = 'house.created'

  public readonly house!: House
  public readonly territoryId!: Territory['id']
  public readonly territoryNumber!: Territory['number']
}
