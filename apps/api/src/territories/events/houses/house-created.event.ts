import { House } from '~/generated/prisma'
import { EventData, EventRecord } from '~/utils/event'

export class HouseCreatedEvent extends EventRecord<HouseCreatedEvent> implements EventData {
  public static readonly event = 'house.created'

  public readonly house!: House
}
