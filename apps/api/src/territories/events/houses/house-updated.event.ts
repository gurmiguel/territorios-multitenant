import { House, Territory } from '~/generated/prisma/client'
import { EventData, EventRecord } from '~/utils/event'

export class HouseUpdatedEvent extends EventRecord<HouseUpdatedEvent> implements EventData {
  public static readonly event = 'house.updated'

  public readonly house!: House
  public readonly territoryId!: Territory['id']
  public readonly territoryNumber!: Territory['number']
}
